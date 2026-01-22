export interface Meal {
    PK: string;
    SK: string;
    mealName: string;
    ingredients: string[];
    updatedAt: string;
}

export interface CreateMealInput {
    name: string;
    date: string;
    ingredients: string[];
}