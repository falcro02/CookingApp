import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    PutCommand,
    GetCommand,
    DeleteCommand,
    UpdateCommand
} from "@aws-sdk/lib-dynamodb";
import { Meal, UpdateMealInput } from '../models/meal';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME || '';

export const mealRepository = {
    async create(meal: Meal): Promise<void> {
        await docClient.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: meal
        }));
    },

    async findById(userId: string, itemID: string): Promise<Meal | null> {
        const result = await docClient.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: { PK: userId, SK: `MEAL#${itemID}` }
        }));
        return (result.Item as Meal) || null;
    },

    async delete(userId: string, itemID: string): Promise<void> {
        await docClient.send(new DeleteCommand({
            TableName: TABLE_NAME,
            Key: { PK: userId, SK: `MEAL#${itemID}` }
        }));
    },

    async update(userId: string, itemID: string, updates: UpdateMealInput): Promise<void> {
        let updateExpression = 'set';
        const expressionAttributeNames: { [key: string]: string } = {};
        const expressionAttributeValues: { [key: string]: any } = {};

        if (updates.description) {
            updateExpression += ' #desc = :desc,';
            expressionAttributeNames['#desc'] = 'description';
            expressionAttributeValues[':desc'] = updates.description;
        }
        if (updates.icon) {
            updateExpression += ' #icon = :icon,';
            expressionAttributeNames['#icon'] = 'icon';
            expressionAttributeValues[':icon'] = updates.icon;
        }

        // Remove the trailing comma
        updateExpression = updateExpression.slice(0, -1);

        await docClient.send(new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { PK: userId, SK: `MEAL#${itemID}` },
            UpdateExpression: updateExpression,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues
        }));
    }
};