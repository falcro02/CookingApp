export interface Meal {
    PK: string;         // Esempio: USER#123
    SK: string;         // Esempio: MEAL#173849503
    itemID: string;     // L'ID univoco che restituiremo al frontend
    description: string;
    icon: string;
    weekDay: number;    // 0 = Monday, 6 = Sunday
    plan: number;       // 1, 2, 3 o 4
}

export interface CreateMealInput {
    description: string;
    icon: string;
    weekDay: number;
    plan: number;
}

export interface UpdateMealInput {
    description?: string;
    icon?: string;
}