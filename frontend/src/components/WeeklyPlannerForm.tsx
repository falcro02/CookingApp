import React, { useState } from 'react';
import { CreateMealInput, DayOfWeek, MealType } from '../types';
import { apiService } from '../services/apiService';

interface Props {
    onPlanSaved: () => void; // A function to refresh the Dashboard after saving
}

export const WeeklyPlannerForm: React.FC<Props> = ({ onPlanSaved }) => {
    const [draftMeals, setDraftMeals] = useState<CreateMealInput[]>([]);
    const [name, setName] = useState('');
    const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>('Monday');
    const [type, setType] = useState<MealType>('Dinner');
    const [isSaving, setIsSaving] = useState(false);

    // Add a single meal to the local draft list
    const handleAddToDraft = () => {
        if (!name.trim()) return;

        const newMeal: CreateMealInput = { name, dayOfWeek, type };
        setDraftMeals([...draftMeals, newMeal]);
        setName(''); // Clear the input field
    };

    // Remove a meal from the draft before saving
    const handleRemoveFromDraft = (indexToRemove: number) => {
        setDraftMeals(draftMeals.filter((_, index) => index !== indexToRemove));
    };

    // Send the massive array to the backend
    const handleSaveWeek = async () => {
        if (draftMeals.length === 0) return;

        setIsSaving(true);
        try {
            await apiService.createWeeklyPlan(draftMeals);
            setDraftMeals([]); // Clear drafts on success
            onPlanSaved(); // Tell the Dashboard to reload and close the modal
        } catch (error) {
            console.error("Failed to save weekly plan", error);
            alert("Failed to save the plan. Check the console.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="weekly-planner-form">
            <div className="add-meal-controls">
                <input
                    type="text"
                    placeholder="Meal Name (e.g., Spaghetti)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <select value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value as DayOfWeek)}>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                        <option key={day} value={day}>{day}</option>
                    ))}
                </select>
                <select value={type} onChange={(e) => setType(e.target.value as MealType)}>
                    {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map(t => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                </select>
                <button onClick={handleAddToDraft}>Add to Draft</button>
            </div>

            <div className="draft-list">
                <h4>Draft Plan ({draftMeals.length} meals)</h4>
                <ul>
                    {draftMeals.map((meal, index) => (
                        <li key={index}>
                            {meal.dayOfWeek} - {meal.type}: {meal.name}
                            <button onClick={() => handleRemoveFromDraft(index)}>X</button>
                        </li>
                    ))}
                </ul>
            </div>

            <button
                className="save-week-button"
                onClick={handleSaveWeek}
                disabled={draftMeals.length === 0 || isSaving}
            >
                {isSaving ? "Saving..." : "Save Entire Weekly Plan"}
            </button>
        </div>
    );
};