import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { UserPreferencesEntity } from '../entities/preferenceEntity';

import { getDynamoClient } from '../utils/db';
const client = getDynamoClient();
const ddbDocClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.TABLE_NAME;

export class UserRepository {
    async getPreferences(userId: string): Promise<UserPreferencesEntity | null> {
        const result = await ddbDocClient.send(
            new GetCommand({
                TableName: tableName,
                Key: {
                    PK: userId,
                    SK: 'PREFERENCES',
                },
            }),
        );
        return (result.Item as UserPreferencesEntity) || null;
    }

    async savePreferences(preferences: UserPreferencesEntity): Promise<void> {
        await ddbDocClient.send(
            new PutCommand({
                TableName: tableName,
                Item: preferences,
            }),
        );
    }
}
