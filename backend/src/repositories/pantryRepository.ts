import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { PantryItemEntity } from '../entities/pantryEntity';

import { getDynamoClient } from "../utils/db";
const client = getDynamoClient();
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME || '';

export const pantryRepository = {
    async findAllByUserId(userId: string): Promise<PantryItemEntity[]> {
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
        return (result.Items as PantryItemEntity[]) || [];
    },

    async save(item: PantryItemEntity): Promise<void> {
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
