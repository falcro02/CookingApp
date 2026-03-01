import { MealRepository } from "../databases/mealRepository";
import { Meal, CreateMealInput } from "../models/meal";

export class MealService {
    private repository: MealRepository;

    constructor() {
        this.repository = new MealRepository();
    }

    async getUserMeals(userId: string): Promise<Meal[]> {
        console.log(`Fetching meals for user: ${userId}`);
        const meals = await this.repository.findAllByUserId(userId);
        return meals.sort((a, b) => (a.SK || "").localeCompare(b.SK || ""));
    }

    async createMeal(userId: string, input: CreateMealInput): Promise<Meal> {
        const newMeal: Meal = {
            PK: userId,
            // ADDED Date.now() HERE: Now it looks like "MEAL#Monday#Dinner#173849503"
            SK: `MEAL#${input.dayOfWeek}#${input.type}#${Date.now()}`,
            name: input.name,
            dayOfWeek: input.dayOfWeek,
            type: input.type,
            isEaten: false
        };

        await this.repository.save(newMeal);
        return newMeal;
    }

    async createWeeklyPlan(userId: string, meals: CreateMealInput[]): Promise<Meal[]> {
        const savedMeals: Meal[] = [];

        // Use Promise.all to save all the meals to DynamoDB at the same time (in parallel)
        await Promise.all(meals.map(async (input) => {
            const newMeal: Meal = {
                PK: userId,
                SK: `MEAL#${input.dayOfWeek}#${input.type}`,
                name: input.name,
                dayOfWeek: input.dayOfWeek,
                type: input.type,
                isEaten: false
            };

            await this.repository.save(newMeal);
            savedMeals.push(newMeal);
        }));

        return savedMeals;
    }

    // Updated to expect the specific SK of the meal to delete
    async deleteUserMeal(userId: string, sk: string): Promise<void> {
        await this.repository.delete(userId, sk);
    }
}