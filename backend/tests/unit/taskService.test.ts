import { taskService } from '../../src/services/taskService';
import { taskRepository } from '../../src/repositories/taskRepository';

jest.mock('../../src/repositories/taskRepository');

describe('taskService', () => {
    const mockUserId = 'USER#123';
    const mockTaskId = 'TASK#456';

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getTaskStatus', () => {
        it('should return the status of a task', async () => {
            (taskRepository.findById as jest.Mock).mockResolvedValue({ status: 2 });

            const result = await taskService.getTaskStatus(mockUserId, mockTaskId);

            expect(result).toBe(2);
            expect(taskRepository.findById).toHaveBeenCalledWith(mockUserId, mockTaskId);
        });

        it('should return null if task is not found', async () => {
            (taskRepository.findById as jest.Mock).mockResolvedValue(null);

            const result = await taskService.getTaskStatus(mockUserId, mockTaskId);

            expect(result).toBeNull();
            expect(taskRepository.findById).toHaveBeenCalledWith(mockUserId, mockTaskId);
        });
    });
});
