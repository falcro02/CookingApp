export interface AiRecipeRequest {
    ingredients: string[];
}

export interface AiRecipeResponse {
    recipeName: string;
    description: string;
    ingredients: string[];
    instructions: string[];
    estimatedTime: string;
}
