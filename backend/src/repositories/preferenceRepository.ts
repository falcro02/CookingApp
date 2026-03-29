import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { UserPreferencesEntity } from '../entities/preferenceEntity';

import { getDynamoClient } from '../utils/db';
const client = getDynamoClient();
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME || '';

export const preferenceRepository = {
    async getPreferences(userId: string): Promise<UserPreferencesEntity | null> {
        const result = await docClient.send(
            new GetCommand({
                TableName: TABLE_NAME,
                Key: {
                    PK: userId,
                    SK: 'PREFERENCES',
                },
            }),
        );
        return (result.Item as UserPreferencesEntity) || null;
    },

    async savePreferences(preferences: UserPreferencesEntity): Promise<void> {
        await docClient.send(
            new PutCommand({
                TableName: TABLE_NAME,
                Item: preferences,
            }),
        );
    },
};
