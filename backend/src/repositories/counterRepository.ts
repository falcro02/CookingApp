import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME || '';

export const counterRepository = {
    async getCount(userId: string, dateKey: string): Promise<number> {
        const result = await docClient.send(
            new GetCommand({
                TableName: TABLE_NAME,
                Key: { PK: userId, SK: `GEN_COUNTER#${dateKey}` },
            }),
        );
        if (!result.Item) return 0;
        return result.Item.count;
    },

    async incrementCount(userId: string, dateKey: string): Promise<void> {
        const tomorrow = new Date(dateKey + 'T00:00:00Z');
        tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
        const ttl = Math.floor(tomorrow.getTime() / 1000);

        await docClient.send(
            new UpdateCommand({
                TableName: TABLE_NAME,
                Key: { PK: userId, SK: `GEN_COUNTER#${dateKey}` },
                UpdateExpression: 'SET #count = if_not_exists(#count, :zero) + :inc, #ttl = :ttl',
                ExpressionAttributeNames: { '#count': 'count', '#ttl': 'ttl' },
                ExpressionAttributeValues: { ':zero': 0, ':inc': 1, ':ttl': ttl },
            }),
        );
    },
};
