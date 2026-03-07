export interface PantryItem {
    PK: string; // USER#<id>
    SK: string; // ITEM#<itemId>
    name: string;
    quantity: string;
}

export interface CreatePantryItemInput {
    name: string;
    quantity: string;
}
