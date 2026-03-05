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
    const path = event.path;
    const itemID = event.pathParameters?.itemID;
    
    // Fallback to 'default-user' per testare in locale senza Cognito
    const userId = event.requestContext?.authorizer?.claims?.sub || 'default-user';
    const PK = `USER#${userId}`;

    try {
        // Rotte Esatte (Senza ID)
        if (httpMethod === 'GET' && path === '/ingredients') return await getIngredients(PK);
        if (httpMethod === 'DELETE' && path === '/ingredients') return await clearIngredients(PK);
        if (httpMethod === 'POST' && path === '/ingredients/import') return await importFromGroceries(PK);
        if (httpMethod === 'POST' && path === '/ingredients') return await addIngredient(PK, event.body);
        
        // Rotte Dinamiche (Con ID)
        if (httpMethod === 'DELETE' && itemID) return await deleteIngredient(PK, itemID);
        if (httpMethod === 'PATCH' && itemID) return await editIngredient(PK, itemID, event.body);

        return { statusCode: 404, body: JSON.stringify({ message: 'Route not found' }) };
    } catch (error: any) {
        console.error("Error:", error);
        // Intercetta l'errore se si cerca di modificare/cancellare un item che non esiste
        if (error.name === 'ConditionalCheckFailedException') {
            return { statusCode: 404, body: JSON.stringify({ message: 'item not found' }) };
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

    // Formatta il dizionario richiesto: { "id": { "description": "..." } }
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
    // 1. Prendi tutti gli ingredienti
    const data = await ddbDocClient.send(new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :skPrefix)",
        ExpressionAttributeValues: { ":pk": PK, ":skPrefix": "INGREDIENT#" }
    }));

    if (!data.Items || data.Items.length === 0) {
        return { statusCode: 204, body: '' }; // Idempotente: è già vuoto
    }

    // 2. Cancellali a blocchi (BatchWriteCommand accetta massimo 25 elementi alla volta)
    const deleteRequests = data.Items.map(item => ({
        DeleteRequest: {
            Key: { PK: item.PK, SK: item.SK }
        }
    }));

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
    if (!body) return { statusCode: 400, body: JSON.stringify({ message: 'invalid field' }) };
    
    let parsedBody;
    try {
        parsedBody = JSON.parse(body);
    } catch {
        return { statusCode: 400, body: JSON.stringify({ message: 'invalid field' }) };
    }

    if (!parsedBody.description || typeof parsedBody.description !== 'string') {
        return { statusCode: 400, body: JSON.stringify({ message: 'invalid field' }) };
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
    // ConditionExpression genera un errore (catturato nel try/catch principale) se l'elemento non esiste
    await ddbDocClient.send(new DeleteCommand({
        TableName: tableName,
        Key: { PK, SK: `INGREDIENT#${itemID}` },
        ConditionExpression: "attribute_exists(PK)" 
    }));

    return { statusCode: 204, body: '' };
}

async function editIngredient(PK: string, itemID: string, body: string | null): Promise<APIGatewayProxyResult> {
    if (!body) return { statusCode: 400, body: JSON.stringify({ message: 'invalid field' }) };
    
    let parsedBody;
    try {
        parsedBody = JSON.parse(body);
    } catch {
        return { statusCode: 400, body: JSON.stringify({ message: 'invalid field' }) };
    }

    if (!parsedBody.description || typeof parsedBody.description !== 'string') {
        return { statusCode: 400, body: JSON.stringify({ message: 'invalid field' }) };
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

async function importFromGroceries(PK: string): Promise<APIGatewayProxyResult> {
    // 1. Recupera la lista della spesa
    const groceriesData = await ddbDocClient.send(new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :skPrefix)",
        ExpressionAttributeValues: { ":pk": PK, ":skPrefix": "GROCERY#" }
    }));

    // Filtra solo quelli "spuntati" (presumo che il campo si chiami 'checked')
    const tickedGroceries = (groceriesData.Items || []).filter(item => item.checked === true);

    if (tickedGroceries.length === 0) {
        return { statusCode: 204, body: '' }; // Nessun elemento da importare
    }

    // 2. Recupera gli ingredienti già in dispensa per evitare duplicati
    const ingredientsData = await ddbDocClient.send(new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :skPrefix)",
        ExpressionAttributeValues: { ":pk": PK, ":skPrefix": "INGREDIENT#" }
    }));

    // Crea un Set con i nomi degli ingredienti (in minuscolo per un confronto esatto e case-insensitive)
    const existingDescriptions = new Set(
        (ingredientsData.Items || []).map(item => item.description.toLowerCase())
    );

    // 3. Filtra la spesa: tieni solo gli elementi che NON sono già in dispensa
    const itemsToImport = tickedGroceries.filter(grocery => 
        !existingDescriptions.has(grocery.description.toLowerCase())
    );

    if (itemsToImport.length === 0) {
        return { statusCode: 204, body: '' }; // Tutti gli elementi erano già presenti
    }

    // 4. Salva i nuovi ingredienti a scaglioni di 25
    const putRequests = itemsToImport.map(item => ({
        PutRequest: {
            Item: {
                PK: PK,
                SK: `INGREDIENT#${randomUUID()}`,
                description: item.description,
                createdAt: new Date().toISOString()
            }
        }
    }));

    for (let i = 0; i < putRequests.length; i += 25) {
        const batch = putRequests.slice(i, i + 25);
        await ddbDocClient.send(new BatchWriteCommand({
            RequestItems: {
                [tableName]: batch
            }
        }));
    }

    return { statusCode: 204, body: '' };
}