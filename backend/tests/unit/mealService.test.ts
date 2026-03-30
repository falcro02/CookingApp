import { mealService } from '../../src/services/mealService';
import { mealRepository } from '../../src/repositories/mealRepository';
import { planRepository } from '../../src/repositories/planRepository';

jest.mock('../../src/repositories/mealRepository');
jest.mock('../../src/repositories/planRepository');

describe('mealService', () => {
    const mockUserId = 'USER#123';

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getMeals', () => {
        it('should return meals for a user', async () => {
            const mockMeals = [
                { itemID: '1', description: 'Pasta', icon: '🍝', weekDay: 1, plan: 1, PK: mockUserId, SK: 'MEAL#1' },
            ];
            (mealRepository.findAllByUser as jest.Mock).mockResolvedValue(mockMeals);

            const result = await mealService.getMeals(mockUserId);
            expect(result).toEqual(mockMeals);
            expect(mealRepository.findAllByUser).toHaveBeenCalledWith(mockUserId);
        });
    });

    describe('createMeal', () => {
        it('should create a meal and return itemID', async () => {
            const input = { description: 'Pizza', icon: '🍕', weekDay: 2, plan: 1 };
            const result = await mealService.createMeal(mockUserId, input);

            expect(result).toBeDefined();
            expect(mealRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    PK: mockUserId,
                    description: 'Pizza',
                    icon: '🍕',
                    weekDay: 2,
                    plan: 1,
                }),
            );
        });

        it('should throw error for invalid field', async () => {
            const invalidInput = { icon: '🍕', weekDay: 2, plan: 1 } as any;
            await expect(mealService.createMeal(mockUserId, invalidInput)).rejects.toThrow('invalid field');
        });

        it('should throw error for invalid weekDay', async () => {
            const invalidInput = { description: 'Pizza', icon: '🍕', weekDay: 8, plan: 1 };
            await expect(mealService.createMeal(mockUserId, invalidInput)).rejects.toThrow(
                'weekDay must be between 0 and 6',
            );
        });

        it('should throw error for invalid plan', async () => {
            const invalidInput = { description: 'Pizza', icon: '🍕', weekDay: 2, plan: 5 };
            await expect(mealService.createMeal(mockUserId, invalidInput)).rejects.toThrow(
                'plan must be between 1 and 4',
            );
        });
    });

    describe('deleteMeal', () => {
        it('should delete a meal and not update plan if other meals exist', async () => {
            const mockMeal = { itemID: '1', plan: 1 };
            (mealRepository.findById as jest.Mock).mockResolvedValue(mockMeal);
            (mealRepository.findByPlan as jest.Mock).mockResolvedValue([{ itemID: '2' }]);

            await mealService.deleteMeal(mockUserId, '1');

            expect(mealRepository.delete).toHaveBeenCalledWith(mockUserId, '1');
            expect(planRepository.setCurrentPlan).not.toHaveBeenCalled();
        });

        it('should delete and update current plan if plan becomes empty', async () => {
            const mockMeal = { itemID: '1', plan: 2 };
            (mealRepository.findById as jest.Mock).mockResolvedValue(mockMeal);
            (mealRepository.findByPlan as jest.Mock)
                .mockResolvedValueOnce([]) // First call for deleted plan (empty)
                .mockResolvedValueOnce([{ itemID: 'other' }]); // Next call looking for previous plan

            (planRepository.getCurrentPlan as jest.Mock).mockResolvedValue(2);

            await mealService.deleteMeal(mockUserId, '1');

            expect(mealRepository.delete).toHaveBeenCalledWith(mockUserId, '1');
            expect(planRepository.setCurrentPlan).toHaveBeenCalledWith(mockUserId, 1);
        });

        it('should throw error if meal not found', async () => {
            (mealRepository.findById as jest.Mock).mockResolvedValue(null);
            await expect(mealService.deleteMeal(mockUserId, '1')).rejects.toThrow('meal not found');
        });
    });

    describe('updateMeal', () => {
        it('should update a meal', async () => {
            (mealRepository.findById as jest.Mock).mockResolvedValue({ itemID: '1' });
            await mealService.updateMeal(mockUserId, '1', { description: 'New Pizza' });

            expect(mealRepository.update).toHaveBeenCalledWith(mockUserId, '1', { description: 'New Pizza' });
        });

        it('should return early if no description or icon provided', async () => {
            await mealService.updateMeal(mockUserId, '1', {});
            expect(mealRepository.findById).not.toHaveBeenCalled();
        });

        it('should throw error if meal not found', async () => {
            (mealRepository.findById as jest.Mock).mockResolvedValue(null);
            await expect(mealService.updateMeal(mockUserId, '1', { description: 'New Pizza' })).rejects.toThrow(
                'meal not found',
            );
        });
    });
});
