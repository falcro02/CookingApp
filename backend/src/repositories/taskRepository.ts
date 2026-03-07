import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { Task } from '../models/task';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME || '';

export const taskRepository = {
    async findById(userId: string, taskID: string): Promise<Task | null> {
        const result = await docClient.send(
            new GetCommand({
                TableName: TABLE_NAME,
                Key: { PK: userId, SK: `TASK#${taskID}` },
            }),
        );
        return (result.Item as Task) || null;
    },

    async create(task: Task): Promise<void> {
        await docClient.send(
            new PutCommand({
                TableName: TABLE_NAME,
                Item: task,
            }),
        );
    },

    async updateStatus(userId: string, taskID: string, status: number, errorMessage?: string): Promise<void> {
        let updateExpression = 'SET #status = :status';
        const expressionAttributeNames: Record<string, string> = { '#status': 'status' };
        const expressionAttributeValues: Record<string, any> = { ':status': status };

        if (errorMessage) {
            updateExpression += ', #errorMessage = :errorMessage';
            expressionAttributeNames['#errorMessage'] = 'errorMessage';
            expressionAttributeValues[':errorMessage'] = errorMessage;
        }

        await docClient.send(
            new UpdateCommand({
                TableName: TABLE_NAME,
                Key: { PK: userId, SK: `TASK#${taskID}` },
                UpdateExpression: updateExpression,
                ExpressionAttributeNames: expressionAttributeNames,
                ExpressionAttributeValues: expressionAttributeValues,
            }),
        );
    },

    async findRunningByUser(userId: string): Promise<Task | null> {
        const result = await docClient.send(
            new QueryCommand({
                TableName: TABLE_NAME,
                KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
                FilterExpression: '#status = :running',
                ExpressionAttributeNames: { '#status': 'status' },
                ExpressionAttributeValues: {
                    ':pk': userId,
                    ':sk': 'TASK#',
                    ':running': 0,
                },
            }),
        );
        const items = result.Items as Task[] | undefined;
        return items && items.length > 0 ? items[0] : null;
    },
};
