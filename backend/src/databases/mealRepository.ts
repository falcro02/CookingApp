import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    PutCommand,
    QueryCommand,
    DeleteCommand
} from "@aws-sdk/lib-dynamodb";
import { Meal } from "../models/meal";

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.TABLE_NAME;

export class MealRepository {

    async findAllByUserId(userId: string): Promise<Meal[]> {
        const result = await ddbDocClient.send(new QueryCommand({
            TableName: tableName,
            KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
            ExpressionAttributeValues: {
                ":pk": userId,
                ":sk": "MEAL#"
            }
        }));
        return (result.Items as Meal[]) || [];
    }

    async save(meal: Meal): Promise<void> {
        await ddbDocClient.send(new PutCommand({
            TableName: tableName,
            Item: meal
        }));
    }

    // Updated to accept the full SK instead of just a date
    async delete(userId: string, sk: string): Promise<void> {
        await ddbDocClient.send(new DeleteCommand({
            TableName: tableName,
            Key: {
                PK: userId,
                SK: sk
            }
        }));
    }
}