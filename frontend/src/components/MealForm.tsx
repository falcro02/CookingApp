import React, { useState } from 'react';
import { CreateMealInput, DAYS_OF_WEEK, DayOfWeek, nameToWeekDay } from '../types';
import { apiService } from '../services/apiService';

interface Props {
    onMealAdded: () => void;
}

export const MealForm: React.FC<Props> = ({ onMealAdded }) => {
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState('🍽️');
    const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>('Monday');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim()) return;

        setIsSaving(true);
        try {
            const newMeal: CreateMealInput = {
                description,
                icon,
                weekDay: nameToWeekDay(dayOfWeek),
                plan: 1, // Default to plan 1
            };
            await apiService.addMeal(newMeal);
            setDescription('');
            onMealAdded();
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
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Meal description (e.g., Lasagna)"
                required
            />
            <input
                type="text"
                value={icon}
                onChange={e => setIcon(e.target.value)}
                placeholder="Emoji"
                style={{ width: '60px', textAlign: 'center' }}
            />
            <select value={dayOfWeek} onChange={e => setDayOfWeek(e.target.value as DayOfWeek)}>
                {DAYS_OF_WEEK.map(d => (
                    <option key={d} value={d}>{d}</option>
                ))}
            </select>
            <button type="submit" disabled={isSaving}>
                {isSaving ? 'Adding...' : 'Add Single Meal'}
            </button>
        </form>
    );
};