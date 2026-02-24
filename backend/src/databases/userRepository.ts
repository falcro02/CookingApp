import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    PutCommand,
    GetCommand
} from "@aws-sdk/lib-dynamodb";
import { UserPreferences } from "../models/preferences";

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.TABLE_NAME;

export class UserRepository {
    async getPreferences(userId: string): Promise<UserPreferences | null> {
        const result = await ddbDocClient.send(new GetCommand({
            TableName: tableName,
            Key: {
                PK: userId,
                SK: "PREFERENCES"
            }
        }));
        return (result.Item as UserPreferences) || null;
    }

    async savePreferences(preferences: UserPreferences): Promise<void> {
        await ddbDocClient.send(new PutCommand({
            TableName: tableName,
            Item: preferences
        }));
    }
}
