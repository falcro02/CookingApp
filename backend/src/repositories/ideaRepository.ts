import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { IdeaItem } from '@shared/types/ideas';

import { getDynamoClient } from "../utils/db";
const client = getDynamoClient();
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME || '';

export const ideaRepository = {
    async findByUser(userId: string): Promise<IdeaItem[] | null> {
        const result = await docClient.send(
            new GetCommand({
                TableName: TABLE_NAME,
                Key: { PK: userId, SK: 'IDEAS' },
            }),
        );
        return result.Item ? (result.Item as any).ideas : null;
    },

    async save(userId: string, ideas: IdeaItem[]): Promise<void> {
        await docClient.send(
            new PutCommand({
                TableName: TABLE_NAME,
                Item: {
                    PK: userId,
                    SK: 'IDEAS',
                    ideas,
                },
            }),
        );
    },

    async delete(userId: string): Promise<void> {
        await docClient.send(
            new DeleteCommand({
                TableName: TABLE_NAME,
                Key: {
                    PK: userId,
                    SK: 'IDEAS',
                },
            }),
        );
    },
};
