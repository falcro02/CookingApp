import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { Meal, weekDayToName } from '../types';
import '../styles/App.css';

export const Dashboard = () => {
    const [todaysMeals, setTodaysMeals] = useState<Meal[]>([]);

    // Get today's weekDay index (0=Monday, 6=Sunday)
    const jsDay = new Date().getDay(); // 0=Sunday, 6=Saturday
    const todayWeekDay = jsDay === 0 ? 6 : jsDay - 1; // Convert to 0=Monday, 6=Sunday
    const todayString = weekDayToName(todayWeekDay);

    useEffect(() => {
        const loadTodaysMeals = async () => {
            try {
                const allMeals = await apiService.getMeals();
                const filtered = allMeals.filter(meal => meal.weekDay === todayWeekDay);
                setTodaysMeals(filtered);
            } catch (error) {
                console.error("Error loading meals:", error);
            }
        };
        loadTodaysMeals();
    }, [todayWeekDay]);

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
                            <div key={meal.itemID || index} className="meal-row">
                                <div className="meal-info">
                                    <span className="meal-icon">{meal.icon}</span>
                                    <span className="meal-name">{meal.description}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};