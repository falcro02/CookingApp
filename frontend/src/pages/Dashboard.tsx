import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { Meal, DayOfWeek } from '../types';
import '../styles/App.css';

// The numerical order for chronological sorting
const MEAL_ORDER = { Breakfast: 1, Lunch: 2, Snack: 3, Dinner: 4 };

export const Dashboard = () => {
    const [todaysMeals, setTodaysMeals] = useState<Meal[]>([]);
    const todayString = new Date().toLocaleDateString('en-US', { weekday: 'long' }) as DayOfWeek;

    useEffect(() => {
        const loadTodaysMeals = async () => {
            try {
                const allMeals = await apiService.getMeals();
                // Filter for today, then sort chronologically
                const filteredAndSorted = allMeals
                    .filter(meal => meal.dayOfWeek === todayString)
                    .sort((a, b) => MEAL_ORDER[a.type] - MEAL_ORDER[b.type]);

                setTodaysMeals(filteredAndSorted);
            } catch (error) {
                console.error("Error loading meals:", error);
            }
        };
        loadTodaysMeals();
    }, [todayString]);

    return (
        <div className="app-container">
            <div className="page-header">
                <h2>{todayString}</h2>
                <p>Here is your menu for today</p>
            </div>

            <div className="day-card expanded">
                <div className="day-meals">
                    {todaysMeals.length === 0 ? (
                        <p className="empty-day">Nothing planned for today.</p>
                    ) : (
                        todaysMeals.map((meal, index) => (
                            <div key={meal.SK || index} className="meal-row">
                                <div className="meal-info">
                                    <span className="meal-icon">🍽️</span>
                                    <span className="meal-name">{meal.name}</span>
                                </div>
                                <span className="meal-type" style={{ fontWeight: 600 }}>{meal.type}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};