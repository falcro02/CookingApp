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

/**
 * Encapsulates all DynamoDB operations for Meals
 */
export class MealRepository {
    /**
     * Finds all meals for a specific user
     */
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

    /**
     * Saves or updates a meal
     */
    async save(meal: Meal): Promise<void> {
        await ddbDocClient.send(new PutCommand({
            TableName: tableName,
            Item: meal
        }));
    }

    /**
     * Deletes a meal by its composite key
     */
    async delete(userId: string, date: string): Promise<void> {
        await ddbDocClient.send(new DeleteCommand({
            TableName: tableName,
            Key: {
                PK: userId,
                SK: `MEAL#${date}`
            }
        }));
    }
}