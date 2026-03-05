import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    PutCommand,
    GetCommand,
    DeleteCommand,
    QueryCommand,
    UpdateCommand,
    BatchWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import { GroceryItem, GenerationCounter, UpdateGroceryRequest } from '../models/grocery';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME || '';

export const groceryRepository = {
    async create(item: GroceryItem): Promise<void> {
        await docClient.send(
            new PutCommand({
                TableName: TABLE_NAME,
                Item: item,
            }),
        );
    },

    async findById(userId: string, itemID: string): Promise<GroceryItem | null> {
        const result = await docClient.send(
            new GetCommand({
                TableName: TABLE_NAME,
                Key: { PK: userId, SK: `GROCERY#${itemID}` },
            }),
        );
        return (result.Item as GroceryItem) || null;
    },

    async delete(userId: string, itemID: string): Promise<void> {
        await docClient.send(
            new DeleteCommand({
                TableName: TABLE_NAME,
                Key: { PK: userId, SK: `GROCERY#${itemID}` },
            }),
        );
    },

    async findAllByUser(userId: string): Promise<GroceryItem[]> {
        const result = await docClient.send(
            new QueryCommand({
                TableName: TABLE_NAME,
                KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
                ExpressionAttributeValues: {
                    ':pk': userId,
                    ':sk': 'GROCERY#',
                },
            }),
        );
        return (result.Items as GroceryItem[]) || [];
    },

    async deleteAllByUser(userId: string): Promise<void> {
        const items = await this.findAllByUser(userId);
        if (items.length === 0) return;

        const batches: GroceryItem[][] = [];
        for (let i = 0; i < items.length; i += 25) {
            batches.push(items.slice(i, i + 25));
        }

        for (const batch of batches) {
            await docClient.send(
                new BatchWriteCommand({
                    RequestItems: {
                        [TABLE_NAME]: batch.map((item) => ({
                            DeleteRequest: {
                                Key: { PK: item.PK, SK: item.SK },
                            },
                        })),
                    },
                }),
            );
        }
    },

    async update(userId: string, itemID: string, updates: UpdateGroceryRequest): Promise<void> {
        const expressionParts: string[] = [];
        const attributeNames: Record<string, string> = {};
        const attributeValues: Record<string, any> = {};

        if (updates.description !== undefined) {
            expressionParts.push('#desc = :desc');
            attributeNames['#desc'] = 'description';
            attributeValues[':desc'] = updates.description;
        }
        if (updates.checked !== undefined) {
            expressionParts.push('#chk = :chk');
            attributeNames['#chk'] = 'checked';
            attributeValues[':chk'] = updates.checked;
        }

        if (expressionParts.length === 0) return;

        await docClient.send(
            new UpdateCommand({
                TableName: TABLE_NAME,
                Key: { PK: userId, SK: `GROCERY#${itemID}` },
                UpdateExpression: `SET ${expressionParts.join(', ')}`,
                ExpressionAttributeNames: attributeNames,
                ExpressionAttributeValues: attributeValues,
            }),
        );
    },

    async updateAllChecked(userId: string, check: boolean): Promise<void> {
        const items = await this.findAllByUser(userId);
        for (const item of items) {
            await docClient.send(
                new UpdateCommand({
                    TableName: TABLE_NAME,
                    Key: { PK: item.PK, SK: item.SK },
                    UpdateExpression: 'SET #chk = :chk',
                    ExpressionAttributeNames: { '#chk': 'checked' },
                    ExpressionAttributeValues: { ':chk': check },
                }),
            );
        }
    },

    async batchCreate(items: GroceryItem[]): Promise<void> {
        if (items.length === 0) return;

        const batches: GroceryItem[][] = [];
        for (let i = 0; i < items.length; i += 25) {
            batches.push(items.slice(i, i + 25));
        }

        for (const batch of batches) {
            await docClient.send(
                new BatchWriteCommand({
                    RequestItems: {
                        [TABLE_NAME]: batch.map((item) => ({
                            PutRequest: {
                                Item: item,
                            },
                        })),
                    },
                }),
            );
        }
    },

    async getGenerationCount(userId: string, dateKey: string): Promise<number> {
        const result = await docClient.send(
            new GetCommand({
                TableName: TABLE_NAME,
                Key: { PK: userId, SK: `GEN_COUNTER#${dateKey}` },
            }),
        );
        if (!result.Item) return 0;
        return (result.Item as GenerationCounter).count;
    },

    async incrementGenerationCount(userId: string, dateKey: string): Promise<void> {
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
