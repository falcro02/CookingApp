export interface AiRecipeRequest {
    ingredients: string[];
    preferences?: {
        dietary: string[];
        allergies: string[];
    };
    mealType?: string; // "Breakfast", "Lunch", "Dinner"
}

export interface AiRecipeResponse {
    recipeName: string;
    description: string;
    ingredients: string[];
    instructions: string[];
    estimatedTime: string;
}

export interface AiGroceryListRequest {
    startDate: string;
    endDate: string;
}
