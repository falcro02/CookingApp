export interface PantryItem {
    PK: string;          // USER#<id>
    SK: string;          // ITEM#<itemId>
    name: string;
    quantity: number;
    unit: string;
    updatedAt: string;
}

export interface CreatePantryItemInput {
    name: string;
    quantity: number;
    unit: string;
}
