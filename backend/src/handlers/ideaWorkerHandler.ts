import { ideaWorkerService } from '../services/ideaWorkerService';
import { IdeasWorkerPayload } from '../models/idea';

export const lambdaHandler = async (event: IdeasWorkerPayload): Promise<void> => {
    console.log('IdeaWorker invoked for task:', event.taskID);

    if (!event.userId || !event.taskID || !event.ingredients || !event.preferences) {
        console.error('Invalid worker payload: missing required fields');
        return;
    }

    await ideaWorkerService.execute(event);

    console.log('IdeaWorker completed for task:', event.taskID);
};
