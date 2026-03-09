export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
export type DayOfWeek = typeof DAYS_OF_WEEK[number];

// Maps weekDay number (0-6) to day name
export const weekDayToName = (weekDay: number): DayOfWeek => DAYS_OF_WEEK[weekDay];
// Maps day name to weekDay number (0-6)
export const nameToWeekDay = (name: DayOfWeek): number => DAYS_OF_WEEK.indexOf(name);

export interface Meal {
    PK?: string;
    SK?: string;
    itemID: string;
    description: string;
    icon: string;
    weekDay: number; // 0 = Monday, 6 = Sunday
    plan: number;    // 1-4
}

export interface CreateMealInput {
    description: string;
    icon: string;
    weekDay: number;
    plan: number;
}