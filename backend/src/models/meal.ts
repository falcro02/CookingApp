export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export interface Meal {
    PK?: string;
    SK?: string;
    name: string;
    dayOfWeek: DayOfWeek;
    type: MealType;
    isEaten?: boolean;
}

export interface CreateMealInput {
    name: string;
    dayOfWeek: DayOfWeek;
    type: MealType;
}

export interface WeeklyPlan {
    id: string; // e.g., "WEEK#2026-02-23" (usually the Monday of that week)
    startDate: string;
    endDate: string;
    isActive: boolean;
    meals: Meal[];
}