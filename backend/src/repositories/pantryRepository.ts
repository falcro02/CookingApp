import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    PutCommand,
    QueryCommand,
    DeleteCommand
} from "@aws-sdk/lib-dynamodb";
import { PantryItem } from "../models/pantry";

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.TABLE_NAME;

export class PantryRepository {
    async findAllByUserId(userId: string): Promise<PantryItem[]> {
        const result = await ddbDocClient.send(new QueryCommand({
            TableName: tableName,
            KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
            ExpressionAttributeValues: {
                ":pk": userId,
                ":sk": "ITEM#"
            }
        }));
        return (result.Items as PantryItem[]) || [];
    }

    async save(item: PantryItem): Promise<void> {
        await ddbDocClient.send(new PutCommand({
            TableName: tableName,
            Item: item
        }));
    }

    async delete(userId: string, itemId: string): Promise<void> {
        await ddbDocClient.send(new DeleteCommand({
            TableName: tableName,
            Key: {
                PK: userId,
                SK: `ITEM#${itemId}`
            }
        }));
    }
}
