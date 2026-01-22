import { MealRepository } from "../databases/mealRepository";
import { Meal, CreateMealInput } from "../models/meal";

/**
 * Service class to handle business logic for Meals.
 * This layer is independent of the transport layer (AWS Lambda)
 * and the data layer (DynamoDB).
 */
export class MealService {
    private repository: MealRepository;

    constructor() {
        this.repository = new MealRepository();
    }

    /**
     * Retrieves all meals for a user and sorts them by date
     */
    async getUserMeals(userId: string): Promise<Meal[]> {
        console.log(`Fetching meals for user: ${userId}`);
        const meals = await this.repository.findAllByUserId(userId);

        // Logic: Sort meals by date (SK) before returning them
        return meals.sort((a, b) => a.SK.localeCompare(b.SK));
    }

    /**
     * Orchestrates the creation of a new meal
     */
    async createMeal(userId: string, input: CreateMealInput): Promise<Meal> {
        const newMeal: Meal = {
            PK: userId,
            SK: `MEAL#${input.date}`,
            mealName: input.name,
            ingredients: input.ingredients || [],
            updatedAt: new Date().toISOString()
        };

        await this.repository.save(newMeal);
        return newMeal;
    }

    /**
     * Handles meal deletion
     */
    async deleteUserMeal(userId: string, date: string): Promise<void> {
        // Business logic could be added here (e.g., check permissions)
        await this.repository.delete(userId, date);
    }
}