export interface Task {
    PK: string;           // USER#<cognitoId>
    SK: string;           // TASK#<taskID>
    taskID: string;
    status: number;       // -1: failed, 0: running, 1: completed
    type: string;         // e.g., "GROCERY_GENERATION"
    createdAt: string;
    errorMessage?: string;
}
