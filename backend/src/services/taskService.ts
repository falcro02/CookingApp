import { taskRepository } from '../repositories/taskRepository';

export const taskService = {
    async getTaskStatus(userId: string, taskID: string): Promise<number | null> {
        const task = await taskRepository.findById(userId, taskID);
        if (!task) return null;
        return task.status;
    }
};
