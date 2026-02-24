import React from 'react';
import { Meal } from '../types';

interface Props {
    meals: Meal[];
    onDelete: (sk: string) => void;
}

export const MealList: React.FC<Props> = ({ meals, onDelete }) => {
    if (meals.length === 0) {
        return <p>No meals planned yet.</p>;
    }

    return (
        <div className="meal-list">
            {meals.map((meal, index) => (
                // Use SK as the key if it exists, otherwise fallback to the array index
                <div key={meal.SK || index} className="meal-item">
                    <h3>{meal.name}</h3>
                    <p>{meal.dayOfWeek} - {meal.type}</p>

                    {/* Only render the delete button if the meal actually has an SK saved from DynamoDB */}
                    {meal.SK && (
                        <button
                            className="delete-button"
                            onClick={() => onDelete(meal.SK!)} // The "!" tells TypeScript we are sure SK exists here
                        >
                            Elimina
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};