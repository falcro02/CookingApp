import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { taskRepository } from '../repositories/taskRepository';
import { mealRepository } from '../repositories/mealRepository';
import { groceryRepository } from '../repositories/groceryRepository';
import { counterRepository } from '../repositories/counterRepository';
import { GroceryItemEntity } from '../entities/groceryEntity';
import { TaskEntity } from '../entities/taskEntity';
import {
    GroceryWorkerPayload,
    GroceryMap
} from '../dto/groceryDto';
import {
    GenerateGroceriesRequest,
    CreateGroceryRequest,
    UpdateGroceryRequest,
} from '@shared/types/groceries';

const lambdaClient = new LambdaClient({});

const DAILY_GENERATION_LIMIT = 3;
const WORKER_FUNCTION_NAME = process.env.GROCERY_WORKER_FUNCTION_NAME || '';

export const groceryService = {
    // --- GET /groceries ---
    async getGroceries(userId: string): Promise<GroceryMap> {
        const items = await groceryRepository.findAllByUser(userId);
        const result: GroceryMap = {};
        for (const item of items) {
            result[item.itemID] = {
                description: item.description,
                weekDay: item.weekDay,
                checked: item.checked,
            };
        }
        return result;
    },

    // --- POST /groceries ---
    async createGrocery(userId: string, input: CreateGroceryRequest): Promise<string> {
        if (!input.description || typeof input.description !== 'string') {
            throw new Error('invalid description');
        }
        if (input.weekDay === undefined || !Number.isInteger(input.weekDay) || input.weekDay < 0 || input.weekDay > 6) {
            throw new Error('invalid week day');
        }

        const itemID = Date.now().toString();
        const item: GroceryItemEntity = {
            PK: userId,
            SK: `GROCERY#${itemID}`,
            itemID,
            description: input.description,
            weekDay: input.weekDay,
            checked: false,
        };

        await groceryRepository.create(item);
        return itemID;
    },

    // --- DELETE /groceries ---
    async clearGroceries(userId: string): Promise<void> {
        await groceryRepository.deleteAllByUser(userId);
    },

    // --- DELETE /groceries/{itemID} ---
    async deleteGrocery(userId: string, itemID: string): Promise<void> {
        const item = await groceryRepository.findById(userId, itemID);
        if (!item) throw new Error('item not found');
        await groceryRepository.delete(userId, itemID);
    },

    // --- PATCH /groceries/{itemID} ---
    async updateGrocery(userId: string, itemID: string, updates: UpdateGroceryRequest): Promise<void> {
        if (updates.description !== undefined && typeof updates.description !== 'string') {
            throw new Error('invalid description');
        }
        if (updates.checked !== undefined && typeof updates.checked !== 'boolean') {
            throw new Error('invalid checked field');
        }
        if (updates.description === undefined && updates.checked === undefined) return;

        const item = await groceryRepository.findById(userId, itemID);
        if (!item) throw new Error('item not found');

        await groceryRepository.update(userId, itemID, updates);
    },

    // --- POST /groceries/check ---
    async checkAll(userId: string, check: boolean): Promise<void> {
        if (typeof check !== 'boolean') {
            throw new Error('invalid check field');
        }
        await groceryRepository.updateAllChecked(userId, check);
    },

    // --- POST /groceries/generate ---
    async generateGroceries(userId: string, request: GenerateGroceriesRequest): Promise<string> {
        this.validateGenerateRequest(request);

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

        // Verify plan has meals (404)
        const meals = await mealRepository.findByPlan(userId, request.plan);
        if (meals.length === 0) {
            const error = new Error('No meals found for the specified plan');
            (error as any).statusCode = 404;
            throw error;
        }

        // Create task record
        const taskID = Date.now().toString();
        const task: TaskEntity = {
            PK: userId,
            SK: `TASK#${taskID}`,
            taskID,
            status: 0,
            type: 'GROCERY_GENERATION',
            createdAt: new Date().toISOString(),
            ttl: Math.floor(Date.now() / 1000) + 3600,
        };
        await taskRepository.create(task);

        // Invoke worker Lambda asynchronously
        const workerPayload: GroceryWorkerPayload = {
            userId,
            taskID,
            days: request.days,
            plan: request.plan,
            unplanned: request.unplanned,
            extra: request.extra,
            replace: request.replace,
        };

        await lambdaClient.send(
            new InvokeCommand({
                FunctionName: WORKER_FUNCTION_NAME,
                InvocationType: 'Event',
                Payload: Buffer.from(JSON.stringify(workerPayload)),
            }),
        );

        return taskID;
    },

    validateGenerateRequest(request: GenerateGroceriesRequest): void {
        if (!Array.isArray(request.days) || request.days.length === 0) {
            throw new Error('days must be a non-empty array');
        }
        for (const day of request.days) {
            if (!Number.isInteger(day) || day < 0 || day > 6) {
                throw new Error('each day must be an integer between 0 and 6');
            }
        }

        if (!Number.isInteger(request.plan) || request.plan < 1 || request.plan > 4) {
            throw new Error('plan must be an integer between 1 and 4');
        }

        if (!Array.isArray(request.unplanned)) {
            throw new Error('unplanned must be an array');
        }

        if (typeof request.extra !== 'string') {
            throw new Error('extra must be a string');
        }

        if (typeof request.replace !== 'boolean') {
            throw new Error('replace must be a boolean');
        }
    },
};
