export interface Idea {
    name: string;
    story: string;
    icon: string;
}

export interface IdeasWorkerPayload {
    userId: string;
    taskID: string;
    ingredients: string[];
    preferences: UserPreferencesPayload;
}

export interface UserPreferencesPayload {
    dietaryRestrictions: string[];
    allergies: string[];
    dislikedIngredients: string[];
    servingSize: number;
}
