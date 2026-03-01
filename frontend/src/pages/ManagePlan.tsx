import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { Meal, DayOfWeek, MealType } from '../types';
import '../styles/App.css';

//TODO - Implement the fuction of the "Plan Tabs" to switch between different saved plans. For now, it just shows "Plan 1" with all meals.

const DAYS_OF_WEEK: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_ORDER = { Breakfast: 1, Lunch: 2, Snack: 3, Dinner: 4 };

export const ManagePlan = () => {
    const [meals, setMeals] = useState<Meal[]>([]);
    const [expandedDay, setExpandedDay] = useState<DayOfWeek | null>('Monday');

    // New state to manage the inline "Add Meal" form
    const [addingMealForDay, setAddingMealForDay] = useState<DayOfWeek | null>(null);
    const [newMealName, setNewMealName] = useState('');
    const [newMealType, setNewMealType] = useState<MealType>('Dinner');
    const [isSaving, setIsSaving] = useState(false);

    const loadMeals = async () => {
        try {
            const data = await apiService.getMeals();
            setMeals(data);
        } catch (error) {
            console.error("Error loading meals:", error);
        }
    };

    useEffect(() => {
        loadMeals();
    }, []);

    const handleDelete = async (sk: string) => {
        try {
            await apiService.deleteMeal(sk);
            loadMeals();
        } catch (error) {
            console.error("Failed to delete", error);
        }
    };

    const toggleDay = (day: DayOfWeek) => {
        setExpandedDay(expandedDay === day ? null : day);
        // Reset the inline form if the user clicks away to another day
        setAddingMealForDay(null);
        setNewMealName('');
    };

    // New function to save the meal directly to the day you clicked
    const handleSaveInlineMeal = async (day: DayOfWeek) => {
        if (!newMealName.trim()) return;
        setIsSaving(true);
        try {
            await apiService.addMeal({
                name: newMealName,
                dayOfWeek: day,
                type: newMealType
            });
            setNewMealName('');
            setAddingMealForDay(null); // Close the inline form
            loadMeals(); // Refresh the list
        } catch (error) {
            console.error("Error saving meal:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="app-container">
            <div className="plan-tabs">
                <button className="tab active">Plan 1</button>
                <button className="tab">Plan 2</button>
                <button className="tab">+</button>
            </div>

            <div className="meals-plan-list">
                {DAYS_OF_WEEK.map((day) => {
                    const mealsForDay = meals.filter(m => m.dayOfWeek === day).sort((a, b) => MEAL_ORDER[a.type] - MEAL_ORDER[b.type]);
                    const isExpanded = expandedDay === day;

                    return (
                        <div key={day} className={`day-card ${isExpanded ? 'expanded' : ''}`}>
                            <div className="day-header" onClick={() => toggleDay(day)}>
                                <h3>{day}</h3>
                                <span className="arrow">{isExpanded ? '⌃' : '⌄'}</span>
                            </div>

                            {isExpanded && (
                                <div className="day-meals">
                                    {/* 1. Show existing meals */}
                                    {mealsForDay.map((meal, index) => (
                                        <div key={meal.SK || index} className="meal-row">
                                            <div className="meal-info">
                                                <span className="meal-icon">🍽️</span>
                                                <span className="meal-name">{meal.name}</span>
                                                <span className="meal-type">({meal.type})</span>
                                            </div>
                                            <button
                                                className="delete-icon"
                                                onClick={() => meal.SK && handleDelete(meal.SK)}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}

                                    {/* 2. Show the Inline "Add" Form OR the "Add Button" */}
                                    {addingMealForDay === day ? (
                                        <div className="inline-add-box">
                                            <input
                                                type="text"
                                                placeholder="Meal name (e.g. Pasta)"
                                                value={newMealName}
                                                onChange={(e) => setNewMealName(e.target.value)}
                                                autoFocus
                                            />
                                            <select
                                                value={newMealType}
                                                onChange={(e) => setNewMealType(e.target.value as MealType)}
                                            >
                                                <option value="Breakfast">Breakfast</option>
                                                <option value="Lunch">Lunch</option>
                                                <option value="Dinner">Dinner</option>
                                                <option value="Snack">Snack</option>
                                            </select>
                                            <div className="inline-actions">
                                                <button
                                                    className="save-btn"
                                                    onClick={() => handleSaveInlineMeal(day)}
                                                    disabled={isSaving}
                                                >
                                                    {isSaving ? '...' : 'Save'}
                                                </button>
                                                <button
                                                    className="cancel-btn"
                                                    onClick={() => setAddingMealForDay(null)}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            className="add-inline-btn"
                                            onClick={() => setAddingMealForDay(day)}
                                        >
                                            + Add Meal to {day}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};