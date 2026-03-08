import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { PantryItem } from '../models/pantry';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME || '';

export const pantryRepository = {
    async findAllByUserId(userId: string): Promise<PantryItem[]> {
        const result = await docClient.send(
            new QueryCommand({
                TableName: TABLE_NAME,
                KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
                ExpressionAttributeValues: {
                    ':pk': userId,
                    ':sk': 'ITEM#',
                },
            }),
        );
        return (result.Items as PantryItem[]) || [];
    },

    async save(item: PantryItem): Promise<void> {
        await docClient.send(
            new PutCommand({
                TableName: TABLE_NAME,
                Item: item,
            }),
        );
    },

    async delete(userId: string, itemId: string): Promise<void> {
        await docClient.send(
            new DeleteCommand({
                TableName: TABLE_NAME,
                Key: {
                    PK: userId,
                    SK: `ITEM#${itemId}`,
                },
            }),
        );
    },
};
