import { groceryWorkerService } from '../services/groceryWorkerService';
import { GroceryWorkerPayload } from '../models/grocery';

export const lambdaHandler = async (event: GroceryWorkerPayload): Promise<void> => {
    console.log("GroceryWorker invoked with payload:", JSON.stringify(event));

    if (!event.userId || !event.taskID || !event.plan || !event.days) {
        console.error("Invalid worker payload:", event);
        return;
    }

    await groceryWorkerService.execute(event);

    console.log("GroceryWorker completed for task:", event.taskID);
};
