export interface GroceryItem {
    PK: string;           // USER#<cognitoId>
    SK: string;           // GROCERY#<itemID>
    itemID: string;
    description: string;
    weekDay: number;      // 0 = Monday, 6 = Sunday
    checked: boolean;
}

export interface GenerationCounter {
    PK: string;           // USER#<cognitoId>
    SK: string;           // GEN_COUNTER#<YYYY-MM-DD>
    count: number;
}

export interface GenerateGroceriesRequest {
    days: number[];       // 0 = Monday, 6 = Sunday
    plan: number;         // 1-4
    unplanned: string[];
    extra: string;
    replace: boolean;
}

export interface CreateGroceryRequest {
    description: string;
    weekDay: number;
}

export interface UpdateGroceryRequest {
    description?: string;
    checked?: boolean;
}

export interface CheckAllRequest {
    check: boolean;
}

export interface GroceryWorkerPayload {
    userId: string;
    taskID: string;
    days: number[];
    plan: number;
    unplanned: string[];
    extra: string;
    replace: boolean;
}

export interface AiGroceryItem {
    description: string;
    weekDay: number;
}
