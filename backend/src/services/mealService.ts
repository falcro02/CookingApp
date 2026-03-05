import { mealRepository } from '../repositories/mealRepository';
import { CreateMealInput, UpdateMealInput, Meal } from '../models/meal';

export const mealService = {
    async createMeal(userId: string, input: CreateMealInput): Promise<string> {
        // Validazione rigorosa come da contratto
        if (!input.description || !input.icon || input.weekDay === undefined || input.plan === undefined) {
            throw new Error('invalid field');
        }
        if (input.weekDay < 0 || input.weekDay > 6) throw new Error('weekDay must be between 0 and 6');
        if (input.plan < 1 || input.plan > 4) throw new Error('plan must be between 1 and 4');

        const itemID = Date.now().toString();

        const newMeal: Meal = {
            PK: userId,
            SK: `MEAL#${itemID}`,
            itemID,
            description: input.description,
            icon: input.icon,
            weekDay: input.weekDay,
            plan: input.plan,
        };

        await mealRepository.create(newMeal);
        return itemID;
    },

    async deleteMeal(userId: string, itemID: string): Promise<void> {
        const meal = await mealRepository.findById(userId, itemID);
        if (!meal) throw new Error('meal not found');

        await mealRepository.delete(userId, itemID);
    },

    async updateMeal(userId: string, itemID: string, updates: UpdateMealInput): Promise<void> {
        if (!updates.description && !updates.icon) return;

        const meal = await mealRepository.findById(userId, itemID);
        if (!meal) throw new Error('meal not found');

        await mealRepository.update(userId, itemID, updates);
    },
};
