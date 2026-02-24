import { CreateMealInput, Meal, PantryItem, CreatePantryItemInput, UserPreferences, UpdatePreferencesInput, AiRecipeRequest, AiRecipeResponse } from "../types";

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://q5jt99qagf.execute-api.eu-south-1.amazonaws.com/Prod/meals';

export const apiService = {
    // --- MEALS ---
    getMeals: async (): Promise<Meal[]> => {
        const response = await fetch(`${API_BASE_URL}/meals`);
        if (!response.ok) throw new Error('Error loading meals');
        return response.json();
    },

    addMeal: async (meal: CreateMealInput): Promise<Meal> => {
        const response = await fetch(`${API_BASE_URL}/meals`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(meal),
        });
        if (!response.ok) throw new Error('Error saving meal');
        return response.json();
    },

    deleteMeal: async (date: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/meals?date=${date}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Error deleting meal');
    },

    // --- PANTRY ---
    getPantryItems: async (): Promise<PantryItem[]> => {
        const response = await fetch(`${API_BASE_URL}/pantry`);
        if (!response.ok) throw new Error('Error loading pantry');
        return response.json();
    },

    addPantryItem: async (item: CreatePantryItemInput): Promise<PantryItem> => {
        const response = await fetch(`${API_BASE_URL}/pantry`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
        });
        if (!response.ok) throw new Error('Error adding pantry item');
        return response.json();
    },

    deletePantryItem: async (itemId: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/pantry?itemId=${itemId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Error deleting pantry item');
    },

    // --- PREFERENCES ---
    getPreferences: async (): Promise<UserPreferences> => {
        const response = await fetch(`${API_BASE_URL}/preferences`);
        if (!response.ok) throw new Error('Error loading preferences');
        return response.json();
    },

    updatePreferences: async (prefs: UpdatePreferencesInput): Promise<UserPreferences> => {
        const response = await fetch(`${API_BASE_URL}/preferences`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prefs),
        });
        if (!response.ok) throw new Error('Error updating preferences');
        return response.json();
    },

    // --- AI RECIPES ---
    generateRecipe: async (request: AiRecipeRequest): Promise<AiRecipeResponse> => {
        const response = await fetch(`${API_BASE_URL}/ai/recipes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request),
        });
        if (!response.ok) throw new Error('Error generating recipe');
        return response.json();
    }
};