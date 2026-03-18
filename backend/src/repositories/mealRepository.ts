import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    PutCommand,
    GetCommand,
    DeleteCommand,
    UpdateCommand,
    QueryCommand,
    BatchWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import { MealEntity } from '../entities/mealEntity';
import { UpdateMealInput } from '@shared/types/plans';

import { getDynamoClient } from "../utils/db";
const client = getDynamoClient();
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME || '';

export const mealRepository = {
    async create(meal: MealEntity): Promise<void> {
        await docClient.send(
            new PutCommand({
                TableName: TABLE_NAME,
                Item: meal,
            }),
        );
    },

    async findById(userId: string, itemID: string): Promise<MealEntity | null> {
        const result = await docClient.send(
            new GetCommand({
                TableName: TABLE_NAME,
                Key: { PK: userId, SK: `MEAL#${itemID}` },
            }),
        );
        return (result.Item as MealEntity) || null;
    },

    //TODO delete of the last meal in a plan have to check it and set the previous plan

    async delete(userId: string, itemID: string): Promise<void> {
        await docClient.send(
            new DeleteCommand({
                TableName: TABLE_NAME,
                Key: { PK: userId, SK: `MEAL#${itemID}` },
            }),
        );
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

        await docClient.send(
            new UpdateCommand({
                TableName: TABLE_NAME,
                Key: { PK: userId, SK: `MEAL#${itemID}` },
                UpdateExpression: updateExpression,
                ExpressionAttributeNames: expressionAttributeNames,
                ExpressionAttributeValues: expressionAttributeValues,
            }),
        );
    },

    async findByPlan(userId: string, plan: number): Promise<MealEntity[]> {
        const result = await docClient.send(
            new QueryCommand({
                TableName: TABLE_NAME,
                KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
                FilterExpression: '#plan = :plan',
                ExpressionAttributeNames: { '#plan': 'plan' },
                ExpressionAttributeValues: {
                    ':pk': userId,
                    ':sk': 'MEAL#',
                    ':plan': plan,
                },
            }),
        );
        return (result.Items as MealEntity[]) || [];
    },

    async findAllByUser(userId: string): Promise<MealEntity[]> {
        const result = await docClient.send(
            new QueryCommand({
                TableName: TABLE_NAME,
                KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
                ExpressionAttributeValues: {
                    ':pk': userId,
                    ':sk': 'MEAL#',
                },
            }),
        );
        return (result.Items as MealEntity[]) || [];
    },

    async deleteByPlan(userId: string, plan: number): Promise<void> {
        const meals = await this.findByPlan(userId, plan);
        if (meals.length === 0) return;

        // DynamoDB BatchWrite supports max 25 items per batch
        const batches = [];
        for (let i = 0; i < meals.length; i += 25) {
            batches.push(meals.slice(i, i + 25));
        }

        for (const batch of batches) {
            await docClient.send(
                new BatchWriteCommand({
                    RequestItems: {
                        [TABLE_NAME]: batch.map((meal) => ({
                            DeleteRequest: {
                                Key: { PK: meal.PK, SK: meal.SK },
                            },
                        })),
                    },
                }),
            );
        }
    },
};
