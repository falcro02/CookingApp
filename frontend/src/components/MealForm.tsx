import React, { useState } from 'react';
import { apiService } from '../services/apiService';
import { CreateMealInput } from '../types';

interface MealFormProps {
    onMealAdded: () => void; // Function to tell App.tsx to refresh the list
}

export const MealForm: React.FC<MealFormProps> = ({ onMealAdded }) => {
    const [name, setName] = useState('');
    const [date, setDate] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !date) return alert("Insert Name and Date!");

        const newMeal: CreateMealInput = {
            name,
            date,
            ingredients: [] // For now we leave it empty, we will manage it with the inventory
        };

        try {
            await apiService.addMeal(newMeal);
            setName('');
            setDate('');
            onMealAdded(); // Notify the parent that a meal has been added
        } catch (error) {
            console.error("Error saving:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="meal-form">
            <input
                type="text"
                placeholder="What do you eat?"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
            />
            <button type="submit">Add Meal</button>
        </form>
    );
};