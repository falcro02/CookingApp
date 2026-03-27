import { groceryWorkerService } from '../services/groceryWorkerService';
import { GroceryWorkerPayload } from '../dto/groceryDto';

export const lambdaHandler = async (event: GroceryWorkerPayload): Promise<void> => {
    console.log('GroceryWorker invoked for task:', event.taskId);

    if (!event.userId || !event.taskId || !event.plan || !event.days) {
        console.error('Invalid worker payload: missing required fields');
        return;
    }

    await groceryWorkerService.execute(event);

    console.log('GroceryWorker completed for task:', event.taskId);
};
