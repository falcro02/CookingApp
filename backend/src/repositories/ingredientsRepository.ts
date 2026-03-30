import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME || 'CookingAppData';

export interface IngredientEntity {
    PK: string;
    SK: string;
    description: string;
}

export const ingredientsRepository = {
    async findAllByUserId(userId: string): Promise<IngredientEntity[]> {
        const command = new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
            ExpressionAttributeValues: {
                ':pk': userId,
                ':sk': 'INGREDIENT#',
            },
        });

        const response = await docClient.send(command);
        return (response.Items as IngredientEntity[]) || [];
    },

    async save(item: IngredientEntity): Promise<void> {
        const command = new PutCommand({
            TableName: TABLE_NAME,
            Item: item,
        });
        await docClient.send(command);
    },

    async delete(userId: string, itemId: string): Promise<void> {
        const command = new DeleteCommand({
            TableName: TABLE_NAME,
            Key: {
                PK: userId,
                SK: `INGREDIENT#${itemId}`,
            },
        });
        await docClient.send(command);
    },

    async deleteAll(userId: string): Promise<void> {
        const items = await this.findAllByUserId(userId);
        for (const item of items) {
            await this.delete(userId, item.SK.replace('INGREDIENT#', ''));
        }
    },
};
