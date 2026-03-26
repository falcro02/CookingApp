import { GroceryItem } from '@shared/types/groceries';

export interface GroceryMap {
    [itemId: string]: GroceryItem;
}

export interface GroceryWorkerPayload {
    userId: string;
    taskId: string;
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
