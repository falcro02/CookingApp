export interface Meal {
    PK: string;
    SK: string;
    mealName: string;
    ingredients: string[];
    updatedAt: string;
}

export interface PantryItem {
    id: string;
    name: string;
    quantity: number;
    unit: string;
}

export interface CreateMealInput {
    name: string;
    date: string;
    ingredients: string[];
}

export interface CreatePantryItemInput {
    name: string;
    quantity: number;
    unit: string;
}

export interface UserPreferences {
    dietaryRestrictions: string[];
    allergies: string[];
    dislikedIngredients: string[];
    servingSize: number;
}

export interface UpdatePreferencesInput {
    dietaryRestrictions?: string[];
    allergies?: string[];
    dislikedIngredients?: string[];
    servingSize?: number;
}

export interface AiRecipeRequest {
    ingredients: string[];
    preferences?: {
        dietary: string[];
        allergies: string[];
    };
    mealType?: string;
}

export interface AiRecipeResponse {
    recipeName: string;
    description: string;
    ingredients: string[];
    instructions: string[];
    estimatedTime: string;
}