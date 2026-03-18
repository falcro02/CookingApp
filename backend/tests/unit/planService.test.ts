import { planService } from '../../src/services/planService';
import { mealRepository } from '../../src/repositories/mealRepository';
import { planRepository } from '../../src/repositories/planRepository';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('../../src/repositories/mealRepository');
jest.mock('../../src/repositories/planRepository');

describe('planService', () => {
    const mockUserId = 'USER#123';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getPlans', () => {
        it('should return current: 1 and plans: { "1": {} } when all plans are empty', async () => {
            // Arrange
            jest.mocked(mealRepository.findAllByUser).mockResolvedValue([]);
            jest.mocked(planRepository.getCurrentPlan).mockResolvedValue(1);

            // Act
            const result = await planService.getPlans(mockUserId);

            // Assert
            expect(result).toEqual({
                current: 1,
                plans: {
                    '1': {},
                },
            });
            expect(mealRepository.findAllByUser).toHaveBeenCalledWith(mockUserId);
            expect(planRepository.getCurrentPlan).toHaveBeenCalledWith(mockUserId);
        });

        it('should return populated plans when meals exist', async () => {
            // Arrange
            const mockMeals = [
                { itemID: 'meal1', description: 'Pizza', icon: '🍕', weekDay: 1, plan: 1 },
                { itemID: 'meal2', description: 'Pasta', icon: '🍝', weekDay: 2, plan: 1 },
                { itemID: 'meal3', description: 'Salad', icon: '🥗', weekDay: 1, plan: 2 },
            ];
            jest.mocked(mealRepository.findAllByUser).mockResolvedValue(mockMeals as any);
            jest.mocked(planRepository.getCurrentPlan).mockResolvedValue(2);

            // Act
            const result = await planService.getPlans(mockUserId);

            // Assert
            expect(result).toEqual({
                current: 2,
                plans: {
                    '1': {
                        meal1: { description: 'Pizza', icon: '🍕', weekDay: 1 },
                        meal2: { description: 'Pasta', icon: '🍝', weekDay: 2 },
                    },
                    '2': {
                        meal3: { description: 'Salad', icon: '🥗', weekDay: 1 },
                    },
                },
            });
        });
    });

    describe('deletePlan', () => {
        it('should call mealRepository.deleteByPlan and not reset current plan if deleting a different plan', async () => {
            // Arrange
            const planToDelete = 2;
            const currentPlan = 1;
            jest.mocked(planRepository.getCurrentPlan).mockResolvedValue(currentPlan);

            // Act
            await planService.deletePlan(mockUserId, planToDelete);

            // Assert
            expect(mealRepository.deleteByPlan).toHaveBeenCalledWith(mockUserId, planToDelete);
            expect(planRepository.setCurrentPlan).not.toHaveBeenCalled();
        });

        it('should reset current plan to 1 if the current plan is deleted', async () => {
            // Arrange
            const planToDelete = 2;
            const currentPlan = 2;
            jest.mocked(planRepository.getCurrentPlan).mockResolvedValue(currentPlan);

            // Act
            await planService.deletePlan(mockUserId, planToDelete);

            // Assert
            expect(mealRepository.deleteByPlan).toHaveBeenCalledWith(mockUserId, planToDelete);
            expect(planRepository.setCurrentPlan).toHaveBeenCalledWith(mockUserId, 1);
        });
    });
});
