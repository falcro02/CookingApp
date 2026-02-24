export interface UserPreferences {
    PK: string;          // USER#<id>
    SK: string;          // PREFERENCES
    dietaryRestrictions: string[]; // e.g., ["Vegan", "Gluten-Free"]
    allergies: string[];           // e.g., ["Peanuts", "Shellfish"]
    dislikedIngredients: string[]; // e.g., ["Cilantro", "Mushrooms"]
    servingSize: number;           // Default serving size for recipes
    updatedAt: string;
}

export interface UpdatePreferencesInput {
    dietaryRestrictions?: string[];
    allergies?: string[];
    dislikedIngredients?: string[];
    servingSize?: number;
}
