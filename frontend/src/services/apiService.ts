import { CreateMealInput, Meal } from "../types";
import { fetchAuthSession } from 'aws-amplify/auth';

// React automatically pulls this from your .env file
const API_BASE_URL = process.env.REACT_APP_API_URL;

if (!API_BASE_URL) {
    console.error("CRITICAL ERROR: REACT_APP_API_URL is missing from the .env file!");
}

const getAuthHeaders = async (): Promise<Record<string, string>> => {
    // Start with the base headers that are always required
    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    };

    try {
        const session = await fetchAuthSession();
        const idToken = session.tokens?.idToken?.toString();

        // If we successfully get a token, add it to the headers dictionary
        if (idToken) {
            headers['Authorization'] = `Bearer ${idToken}`;
        }
    } catch (error) {
        console.warn("No valid user session found, proceeding with unauthenticated request");
    }

    return headers;
};

export const apiService = {
    getMeals: async (): Promise<Meal[]> => {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/meals`, { method: 'GET', headers });
        if (!response.ok) throw new Error('Error loading meals');
        return response.json();
    },

    addMeal: async (meal: CreateMealInput): Promise<Meal> => {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/meals`, {
            method: 'POST',
            headers,
            body: JSON.stringify(meal),
        });
        if (!response.ok) throw new Error('Error saving meal');
        return response.json();
    },

    // NEW: Save an entire week of meals at once
    createWeeklyPlan: async (meals: CreateMealInput[]): Promise<Meal[]> => {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/weekly-plans`, {
            method: 'POST',
            headers,
            body: JSON.stringify(meals),
        });
        if (!response.ok) throw new Error('Error saving weekly plan');
        const data = await response.json();
        return data.meals;
    },

    // UPDATED: Now deletes using the specific DynamoDB Sort Key (SK)
    deleteMeal: async (sk: string): Promise<void> => {
        const headers = await getAuthHeaders();
        // We encode the SK because it contains special characters like '#'
        const response = await fetch(`${API_BASE_URL}/meals?sk=${encodeURIComponent(sk)}`, {
            method: 'DELETE',
            headers
        });
        if (!response.ok) throw new Error('Error deleting meal');
    }
};