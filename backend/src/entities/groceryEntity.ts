export interface GroceryItemEntity {
    PK: string; // USER#<cognitoId>
    SK: string; // GROCERY#<itemID>
    itemID: string;
    description: string;
    weekDay: number;
    checked: boolean;
}

export interface GenerationCounterEntity {
    PK: string;
    SK: string;
    count: number;
}
