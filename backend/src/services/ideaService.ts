import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { IdeaItem } from '@shared/types/ideas';
import { IdeasWorkerPayload } from '../dto/ideaDto';
import { ideaRepository } from '../repositories/ideaRepository';
import { counterRepository } from '../repositories/counterRepository';
import { taskRepository } from '../repositories/taskRepository';
import { TaskEntity } from '../entities/taskEntity';
import { preferencesService } from './preferencesService';

const lambdaClient = new LambdaClient({});

const WORKER_FUNCTION_NAME = process.env.IDEAS_WORKER_FUNCTION_NAME || '';

const DAILY_GENERATION_LIMIT = 3;

export const ideaService = {
    async getIdeas(userId: string): Promise<IdeaItem[]> {
        const ideas = await ideaRepository.findByUser(userId);
        return ideas || [];
    },

    async deleteIdeas(userId: string): Promise<void> {
        await ideaRepository.delete(userId);
    },

    async generateIdea(userId: string, ingredients: string[]): Promise<string> {
        // Check daily generation limit (429)
        const today = new Date().toISOString().split('T')[0];
        const currentCount = await counterRepository.getCount(userId, today);
        if (currentCount >= DAILY_GENERATION_LIMIT) {
            const error = new Error('Daily generation limit reached');
            (error as any).statusCode = 429;
            throw error;
        }

        // Check no running task (409)
        const runningTask = await taskRepository.findRunningByUser(userId);
        if (runningTask) {
            const error = new Error('A generation task is already running');
            (error as any).statusCode = 409;
            throw error;
        }

        // Fetch user preferences
        const userPrefs = await preferencesService.getPreferences(userId);

        // Create task record
        const taskId = Date.now().toString();
        const task: TaskEntity = {
            PK: userId,
            SK: `TASK#${taskId}`,
            taskId,
            status: 0,
            type: 'IDEA_GENERATION',
            createdAt: new Date().toISOString(),
            ttl: Math.floor(Date.now() / 1000) + 3600,
        };
        await taskRepository.create(task);

        // Invoke worker Lambda asynchronously
        const workerPayload: IdeasWorkerPayload = {
            userId,
            taskId,
            ingredients,
            preferences: {
                dietary: userPrefs.preferences.dietary,
                allergies: userPrefs.preferences.allergies,
                disliked: userPrefs.preferences.disliked,
            },
        };

        await lambdaClient.send(
            new InvokeCommand({
                FunctionName: WORKER_FUNCTION_NAME,
                InvocationType: 'Event',
                Payload: Buffer.from(JSON.stringify(workerPayload)),
            }),
        );

        return taskId;
    },
};
