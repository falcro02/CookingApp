import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { UserPreferences } from '../models/preferences';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME || '';

export const preferenceRepository = {
    async getPreferences(userId: string): Promise<UserPreferences | null> {
        const result = await docClient.send(
            new GetCommand({
                TableName: TABLE_NAME,
                Key: {
                    PK: userId,
                    SK: 'PREFERENCES',
                },
            }),
        );
        return (result.Item as UserPreferences) || null;
    },

    async savePreferences(preferences: UserPreferences): Promise<void> {
        await docClient.send(
            new PutCommand({
                TableName: TABLE_NAME,
                Item: preferences,
            }),
        );
    },
};
