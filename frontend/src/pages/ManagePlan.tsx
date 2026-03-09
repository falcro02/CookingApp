import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { Meal, DAYS_OF_WEEK, DayOfWeek, weekDayToName, nameToWeekDay } from '../types';
import '../styles/App.css';

export const ManagePlan = () => {
    const [meals, setMeals] = useState<Meal[]>([]);
    const [expandedDay, setExpandedDay] = useState<DayOfWeek | null>('Monday');

    // New state to manage the inline "Add Meal" form
    const [addingMealForDay, setAddingMealForDay] = useState<DayOfWeek | null>(null);
    const [newMealDesc, setNewMealDesc] = useState('');
    const [newMealIcon, setNewMealIcon] = useState('🍽️');
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

    const handleDelete = async (itemID: string) => {
        try {
            await apiService.deleteMeal(itemID);
            loadMeals();
        } catch (error) {
            console.error("Failed to delete", error);
        }
    };

    const toggleDay = (day: DayOfWeek) => {
        setExpandedDay(expandedDay === day ? null : day);
        setAddingMealForDay(null);
        setNewMealDesc('');
    };

    const handleSaveInlineMeal = async (day: DayOfWeek) => {
        if (!newMealDesc.trim()) return;
        setIsSaving(true);
        try {
            await apiService.addMeal({
                description: newMealDesc,
                icon: newMealIcon,
                weekDay: nameToWeekDay(day),
                plan: 1, // Default to plan 1 for now
            });
            setNewMealDesc('');
            setNewMealIcon('🍽️');
            setAddingMealForDay(null);
            loadMeals();
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
                    const dayIndex = nameToWeekDay(day);
                    const mealsForDay = meals.filter(m => m.weekDay === dayIndex);
                    const isExpanded = expandedDay === day;

                    return (
                        <div key={day} className={`day-card ${isExpanded ? 'expanded' : ''}`}>
                            <div className="day-header" onClick={() => toggleDay(day)}>
                                <h3>{day}</h3>
                                <span className="arrow">{isExpanded ? '⌃' : '⌄'}</span>
                            </div>

                            {isExpanded && (
                                <div className="day-meals">
                                    {mealsForDay.map((meal, index) => (
                                        <div key={meal.itemID || index} className="meal-row">
                                            <div className="meal-info">
                                                <span className="meal-icon">{meal.icon}</span>
                                                <span className="meal-name">{meal.description}</span>
                                            </div>
                                            <button
                                                className="delete-icon"
                                                onClick={() => meal.itemID && handleDelete(meal.itemID)}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}

                                    {addingMealForDay === day ? (
                                        <div className="inline-add-box">
                                            <input
                                                type="text"
                                                placeholder="Meal description (e.g. Pasta)"
                                                value={newMealDesc}
                                                onChange={(e) => setNewMealDesc(e.target.value)}
                                                autoFocus
                                            />
                                            <input
                                                type="text"
                                                placeholder="Emoji icon"
                                                value={newMealIcon}
                                                onChange={(e) => setNewMealIcon(e.target.value)}
                                                style={{ width: '60px', textAlign: 'center' }}
                                            />
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