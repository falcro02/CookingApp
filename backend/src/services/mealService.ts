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

        // Check if this was the last meal in the plan
        const remainingMeals = await mealRepository.findByPlan(userId, meal.plan);
        if (remainingMeals.length === 0) {
            // Plan is now empty — if it was the current plan, auto-switch
            const currentPlan = await planRepository.getCurrentPlan(userId);
            if (currentPlan === meal.plan) {
                let newCurrent = 1; // default: plan 1 (even if empty)
                for (let p = meal.plan - 1; p >= 1; p--) {
                    const meals = await mealRepository.findByPlan(userId, p);
                    if (meals.length > 0) {
                        newCurrent = p;
                        break;
                    }
                }
                await planRepository.setCurrentPlan(userId, newCurrent);
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
