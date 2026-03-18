import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { CurrentPlanEntity } from '../entities/planEntity';

import { getDynamoClient } from "../utils/db";
const client = getDynamoClient();
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME || '';

export const planRepository = {
    async getCurrentPlan(userId: string): Promise<number> {
        const result = await docClient.send(
            new GetCommand({
                TableName: TABLE_NAME,
                Key: { PK: userId, SK: 'CURRENT_PLAN' },
            }),
        );
        return result.Item ? (result.Item as CurrentPlanEntity).current : 1;
    },

    async setCurrentPlan(userId: string, plan: number): Promise<void> {
        await docClient.send(
            new PutCommand({
                TableName: TABLE_NAME,
                Item: {
                    PK: userId,
                    SK: 'CURRENT_PLAN',
                    current: plan,
                },
            }),
        );
    },
};
