import { mealRepository } from '../repositories/mealRepository';
import { planRepository } from '../repositories/planRepository';
import { MealEntity } from '../entities/mealEntity';
import { CreateMealInput, UpdateMealInput } from '@shared/types/plans';

export const mealService = {
    async getMeals(userId: string): Promise<MealEntity[]> {
        return await mealRepository.findAllByUser(userId);
    },

    async createMeal(userId: string, input: CreateMealInput): Promise<string> {
        if (!input.description || !input.icon || input.weekDay === undefined || input.plan === undefined) {
            throw new Error('invalid field');
        }
        if (input.weekDay < 0 || input.weekDay > 6) throw new Error('weekDay must be between 0 and 6');
        if (input.plan < 1 || input.plan > 4) throw new Error('plan must be between 1 and 4');

        const itemId = Date.now().toString();

        const newMealEntity: MealEntity = {
            PK: userId,
            SK: `MEAL#${itemId}`,
            itemId,
            description: input.description,
            icon: input.icon,
            weekDay: input.weekDay,
            plan: input.plan,
        };

        await mealRepository.create(newMealEntity);
        return itemId;
    },

    async deleteMeal(userId: string, itemId: string): Promise<void> {
        const meal = await mealRepository.findById(userId, itemId);
        if (!meal) throw new Error('meal not found');

        await mealRepository.delete(userId, itemId);

        // Check if this was the last meal in the current plan
        const currentPlan = await planRepository.getCurrentPlan(userId);
        if (meal.plan === currentPlan) {
            const remainingMeals = await mealRepository.findByPlan(userId, meal.plan);
            if (remainingMeals.length === 0) {
                // Find the highest non-empty plan (4 down to 1)
                const allMeals = await mealRepository.findAllByUser(userId);
                const planCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
                for (const m of allMeals) {
                    planCounts[m.plan]++;
                }

                let nextPlan = 1;
                for (let i = 4; i > 0; i--) {
                    if (planCounts[i] > 0) {
                        nextPlan = i;
                        break;
                    }
                }
                await planRepository.setCurrentPlan(userId, nextPlan);
            }
        }
    },

    async updateMeal(userId: string, itemId: string, updates: UpdateMealInput): Promise<void> {
        if (!updates.description && !updates.icon) return;

        const meal = await mealRepository.findById(userId, itemId);
        if (!meal) throw new Error('meal not found');

        await mealRepository.update(userId, itemId, updates);
    },
};
