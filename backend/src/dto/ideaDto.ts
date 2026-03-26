import { UserPreferencesPayload } from '@shared/types/preferences';

export interface IdeasWorkerPayload {
    userId: string;
    taskId: string;
    ingredients: string[];
    preferences: UserPreferencesPayload;
}
