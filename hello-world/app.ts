import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    PutCommand,
    QueryCommand,
    DeleteCommand
} from "@aws-sdk/lib-dynamodb";

// Initialize the DynamoDB client
const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

// Get the table name from environment variables
const tableName = process.env.TABLE_NAME;

/**
 * Main Lambda handler to manage meal operations (CRUD)
 */
export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const method = event.httpMethod;
    const path = event.path;

    // Static user ID for development
    const userId = "USER#1";

    // Standard headers for CORS - Essential for browser-to-server communication
    const headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Allows requests from any origin (localhost, web, etc.)
        "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    };

    try {
        console.log(`Processing ${method} request for path: ${path}`);

        // --- 1. CORS PREFLIGHT: Handle OPTIONS request ---
        // Browsers send an OPTIONS request before POST/DELETE to check permissions
        if (method === 'OPTIONS') {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ message: "Success" })
            };
        }

        // --- 2. READ: GET all meals for the user ---
        if (method === 'GET') {
            const data = await ddbDocClient.send(new QueryCommand({
                TableName: tableName,
                KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
                ExpressionAttributeValues: {
                    ":pk": userId,
                    ":sk": "MEAL#"
                }
            }));

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(data.Items)
            };
        }

        // --- 3. CREATE/UPDATE: POST a new meal ---
        if (method === 'POST') {
            const body = JSON.parse(event.body || '{}');

            if (!body.date || !body.name) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ message: "Validation failed: Missing date or name" })
                };
            }

            const item = {
                PK: userId,
                SK: `MEAL#${body.date}`,
                mealName: body.name,
                ingredients: body.ingredients || [],
                updatedAt: new Date().toISOString()
            };

            await ddbDocClient.send(new PutCommand({
                TableName: tableName,
                Item: item
            }));

            return {
                statusCode: 201,
                headers,
                body: JSON.stringify({ message: "Meal saved successfully", item })
            };
        }

        // --- 4. DELETE: Remove a specific meal ---
        if (method === 'DELETE') {
            const dateToDelete = event.queryStringParameters?.date;

            if (!dateToDelete) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ message: "Validation failed: Missing date parameter" })
                };
            }

            await ddbDocClient.send(new DeleteCommand({
                TableName: tableName,
                Key: {
                    PK: userId,
                    SK: `MEAL#${dateToDelete}`
                }
            }));

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ message: "Meal deleted successfully" })
            };
        }

        // Fallback for unsupported methods
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ message: "Method not allowed" })
        };

    } catch (err: any) {
        console.error("Critical Error:", err);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                message: "Internal Server Error",
                error: err instanceof Error ? err.message : String(err)
            })
        };
    }
};