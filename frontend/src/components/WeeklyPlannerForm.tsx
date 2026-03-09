import React, { useState } from 'react';
import { CreateMealInput, DAYS_OF_WEEK, DayOfWeek, nameToWeekDay } from '../types';
import { apiService } from '../services/apiService';

interface Props {
    onPlanSaved: () => void;
}

export const WeeklyPlannerForm: React.FC<Props> = ({ onPlanSaved }) => {
    const [draftMeals, setDraftMeals] = useState<CreateMealInput[]>([]);
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState('🍽️');
    const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>('Monday');
    const [isSaving, setIsSaving] = useState(false);

    const handleAddToDraft = () => {
        if (!description.trim()) return;

        const newMeal: CreateMealInput = {
            description,
            icon,
            weekDay: nameToWeekDay(dayOfWeek),
            plan: 1,
        };
        setDraftMeals([...draftMeals, newMeal]);
        setDescription('');
    };

    const handleRemoveFromDraft = (indexToRemove: number) => {
        setDraftMeals(draftMeals.filter((_, index) => index !== indexToRemove));
    };

    const handleSaveWeek = async () => {
        if (draftMeals.length === 0) return;

        setIsSaving(true);
        try {
            // Save each meal individually
            for (const meal of draftMeals) {
                await apiService.addMeal(meal);
            }
            setDraftMeals([]);
            onPlanSaved();
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
                    placeholder="Meal description (e.g., Spaghetti)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Emoji"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    style={{ width: '60px', textAlign: 'center' }}
                />
                <select value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value as DayOfWeek)}>
                    {DAYS_OF_WEEK.map(day => (
                        <option key={day} value={day}>{day}</option>
                    ))}
                </select>
                <button onClick={handleAddToDraft}>Add to Draft</button>
            </div>

            <div className="draft-list">
                <h4>Draft Plan ({draftMeals.length} meals)</h4>
                <ul>
                    {draftMeals.map((meal, index) => (
                        <li key={index}>
                            {DAYS_OF_WEEK[meal.weekDay]} - {meal.icon} {meal.description}
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