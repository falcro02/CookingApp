import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    QueryCommand,
    PutCommand,
    DeleteCommand,
    UpdateCommand,
    BatchWriteCommand
} from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.TABLE_NAME!;

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const httpMethod = event.httpMethod;
    const itemID = event.pathParameters?.itemID;
    
    // Fallback to 'default-user' so you can test locally without Cognito auth enabled yet
    const userId = event.requestContext?.authorizer?.claims?.sub || 'default-user';
    const PK = `USER#${userId}`;

    try {
        if (httpMethod === 'GET' && !itemID) return await getIngredients(PK);
        if (httpMethod === 'DELETE' && !itemID) return await clearIngredients(PK);
        if (httpMethod === 'POST') return await addIngredient(PK, event.body);
        if (httpMethod === 'DELETE' && itemID) return await deleteIngredient(PK, itemID);
        if (httpMethod === 'PATCH' && itemID) return await editIngredient(PK, itemID, event.body);

        return { statusCode: 404, body: JSON.stringify({ message: 'Route not found' }) };
    } catch (error: any) {
        console.error("Error:", error);
        if (error.name === 'ConditionalCheckFailedException') {
            return { statusCode: 404, body: JSON.stringify({ message: 'Item not found' }) };
        }
        return { statusCode: 500, body: JSON.stringify({ message: 'Internal server error' }) };
    }
};

// --- ROUTE HANDLERS ---

async function getIngredients(PK: string): Promise<APIGatewayProxyResult> {
    const data = await ddbDocClient.send(new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :skPrefix)",
        ExpressionAttributeValues: {
            ":pk": PK,
            ":skPrefix": "INGREDIENT#"
        }
    }));

    // Format into the requested dictionary: { "id": { "description": "..." } }
    const ingredientsDict: Record<string, { description: string }> = {};
    
    data.Items?.forEach(item => {
        const id = item.SK.replace('INGREDIENT#', '');
        ingredientsDict[id] = { description: item.description };
    });

    return {
        statusCode: 200,
        body: JSON.stringify({ ingredients: ingredientsDict })
    };
}

async function clearIngredients(PK: string): Promise<APIGatewayProxyResult> {
    // 1. Fetch all ingredients
    const data = await ddbDocClient.send(new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :skPrefix)",
        ExpressionAttributeValues: { ":pk": PK, ":skPrefix": "INGREDIENT#" }
    }));

    if (!data.Items || data.Items.length === 0) {
        return { statusCode: 204, body: '' }; // Idempotent: already empty
    }

    // 2. Delete them in batches (DynamoDB allows max 25 per batch)
    const deleteRequests = data.Items.map(item => ({
        DeleteRequest: {
            Key: { PK: item.PK, SK: item.SK }
        }
    }));

    // Chunk array into sizes of 25
    for (let i = 0; i < deleteRequests.length; i += 25) {
        const batch = deleteRequests.slice(i, i + 25);
        await ddbDocClient.send(new BatchWriteCommand({
            RequestItems: {
                [tableName]: batch
            }
        }));
    }

    return { statusCode: 204, body: '' };
}

async function addIngredient(PK: string, body: string | null): Promise<APIGatewayProxyResult> {
    if (!body) return { statusCode: 400, body: JSON.stringify({ message: 'Missing body' }) };
    
    const parsedBody = JSON.parse(body);
    if (!parsedBody.description || typeof parsedBody.description !== 'string') {
        return { statusCode: 400, body: JSON.stringify({ message: 'Invalid field: description is required' }) };
    }

    const itemID = randomUUID();
    
    await ddbDocClient.send(new PutCommand({
        TableName: tableName,
        Item: {
            PK: PK,
            SK: `INGREDIENT#${itemID}`,
            description: parsedBody.description,
            createdAt: new Date().toISOString()
        }
    }));

    return { 
        statusCode: 201, 
        body: JSON.stringify({ itemID }) 
    };
}

async function deleteIngredient(PK: string, itemID: string): Promise<APIGatewayProxyResult> {
    // ConditionExpression ensures it returns 404 (caught in the main try/catch) if it doesn't exist
    await ddbDocClient.send(new DeleteCommand({
        TableName: tableName,
        Key: { PK, SK: `INGREDIENT#${itemID}` },
        ConditionExpression: "attribute_exists(PK)" 
    }));

    return { statusCode: 204, body: '' };
}

async function editIngredient(PK: string, itemID: string, body: string | null): Promise<APIGatewayProxyResult> {
    if (!body) return { statusCode: 400, body: JSON.stringify({ message: 'Missing body' }) };
    
    const parsedBody = JSON.parse(body);
    if (!parsedBody.description || typeof parsedBody.description !== 'string') {
        return { statusCode: 400, body: JSON.stringify({ message: 'Invalid field: description is required' }) };
    }

    await ddbDocClient.send(new UpdateCommand({
        TableName: tableName,
        Key: { PK, SK: `INGREDIENT#${itemID}` },
        UpdateExpression: "SET description = :desc",
        ConditionExpression: "attribute_exists(PK)",
        ExpressionAttributeValues: {
            ":desc": parsedBody.description
        }
    }));

    return { statusCode: 204, body: '' };
}