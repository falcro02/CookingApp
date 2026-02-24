import React, { useEffect, useState } from 'react';
import { MealList } from '../components/MealList';
import { MealForm } from '../components/MealForm';
import { apiService } from '../services/apiService';
import { Meal } from '../types';

const Dashboard: React.FC = () => {
    const [meals, setMeals] = useState<Meal[]>([]);

    const loadMeals = async () => {
        try {
            const data = await apiService.getMeals();
            setMeals(data);
        } catch (error) {
            console.error("Error loading meals:", error);
        }
    };

    const handleDelete = async (date: string) => {
        try {
            await apiService.deleteMeal(date);
            await loadMeals();
        } catch (error) {
            console.error("Error during deletion:", error);
        }
    };

    useEffect(() => {
        loadMeals();
    }, []);

    return (
        <div>
            <h2>Weekly Meal Plan</h2>
            <MealForm onMealAdded={loadMeals} />
            <MealList meals={meals} onDelete={handleDelete} />
        </div>
    );
};

export default Dashboard;
