import React from 'react';
import { Meal } from '../types';

interface Props {
    meals: Meal[];
    onDelete: (date: string) => void;
}

export const MealList: React.FC<Props> = ({ meals, onDelete }) => {
    return (
        <div className="meal-list">
            {meals.map((meal) => (
                <div key={meal.SK} className="meal-item">
                    <h3>{meal.mealName}</h3>
                    <p>Data: {meal.SK.replace('MEAL#', '')}</p>
                    <button onClick={() => onDelete(meal.SK.replace('MEAL#', ''))}>
                        Elimina
                    </button>
                </div>
            ))}
        </div>
    );
};