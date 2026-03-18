export interface TaskEntity {
    PK: string;
    SK: string; 
    taskID: string;
    status: number;
    type: string;
    createdAt: string;
    errorMessage?: string;
    ttl: number; // Unix timestamp (seconds) for DynamoDB TTL auto-deletion
}
