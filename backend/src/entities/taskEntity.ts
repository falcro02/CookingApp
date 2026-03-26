export interface TaskEntity {
    PK: string;
    SK: string;
    taskId: string;
    status: number;
    type: string;
    createdAt: string;
    errorMessage?: string;
    ttl: number; // Unix timestamp (seconds) for DynamoDB TTL auto-deletion
}
