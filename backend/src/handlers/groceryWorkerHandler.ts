import { groceryWorkerService } from '../services/groceryWorkerService';
import { GroceryWorkerPayload } from '../dto/groceryDto';

export const lambdaHandler = async (event: GroceryWorkerPayload): Promise<void> => {
    console.log('GroceryWorker invoked for task:', event.taskID);

    if (!event.userId || !event.taskID || !event.plan || !event.days) {
        console.error('Invalid worker payload: missing required fields');
        return;
    }

    await groceryWorkerService.execute(event);

    console.log('GroceryWorker completed for task:', event.taskID);
};
