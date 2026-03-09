import React from 'react';
import { Meal, weekDayToName } from '../types';

interface Props {
    meals: Meal[];
    onDelete: (itemID: string) => void;
}

export const MealList: React.FC<Props> = ({ meals, onDelete }) => {
    if (meals.length === 0) {
        return <p>No meals planned yet.</p>;
    }

    return (
        <div className="meal-list">
            {meals.map((meal, index) => (
                <div key={meal.itemID || index} className="meal-item">
                    <h3>{meal.icon} {meal.description}</h3>
                    <p>{weekDayToName(meal.weekDay)} - Plan {meal.plan}</p>

                    {meal.itemID && (
                        <button
                            className="delete-button"
                            onClick={() => onDelete(meal.itemID)}
                        >
                            Elimina
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};