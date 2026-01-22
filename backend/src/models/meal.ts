/**
 * Represents a Meal item in our domain and database
 */
export interface Meal {
    PK: string;          // USER#<id>
    SK: string;          // MEAL#<date>
    mealName: string;
    ingredients: string[];
    updatedAt: string;
}

/**
 * Data required to create a new meal from the frontend
 */
export interface CreateMealInput {
    name: string;
    date: string;
    ingredients?: string[];
}