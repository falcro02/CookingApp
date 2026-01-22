import { CreateMealInput, Meal } from "../types";

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://0v6qxoabjc.execute-api.eu-south-1.amazonaws.com/Prod';

export const apiService = {
    // Retrive all meals
    getMeals: async (): Promise<Meal[]> => {
        const response = await fetch(`${API_BASE_URL}/meals`);
        if (!response.ok) throw new Error('Errore nel caricamento dei pasti');
        return response.json();
    },

    // Adds a new meal
    addMeal: async (meal: CreateMealInput): Promise<Meal> => {
        const response = await fetch(`${API_BASE_URL}/meals`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(meal),
        });
        if (!response.ok) throw new Error('Errore durante il salvataggio');
        return response.json();
    },

    // Deletes a meal
    deleteMeal: async (date: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/meals?date=${date}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Errore durante la cancellazione');
    }
};