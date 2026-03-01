import React, { useState } from 'react';
import { CreateMealInput, DayOfWeek, MealType } from '../types';
import { apiService } from '../services/apiService';

interface Props {
    onMealAdded: () => void;
}

export const MealForm: React.FC<Props> = ({ onMealAdded }) => {
    const [name, setName] = useState('');
    const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>('Monday');
    const [type, setType] = useState<MealType>('Dinner');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsSaving(true);
        try {
            const newMeal: CreateMealInput = { name, dayOfWeek, type };
            await apiService.addMeal(newMeal);
            setName(''); // Clear input after saving
            onMealAdded(); // Refresh the list
        } catch (error) {
            console.error("Error adding meal:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form className="meal-form" onSubmit={handleSubmit}>
            <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Meal Name (e.g., Lasagna)"
                required
            />
            <select value={dayOfWeek} onChange={e => setDayOfWeek(e.target.value as DayOfWeek)}>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                    <option key={d} value={d}>{d}</option>
                ))}
            </select>
            <select value={type} onChange={e => setType(e.target.value as MealType)}>
                {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map(t => (
                    <option key={t} value={t}>{t}</option>
                ))}
            </select>
            <button type="submit" disabled={isSaving}>
                {isSaving ? 'Adding...' : 'Add Single Meal'}
            </button>
        </form>
    );
};