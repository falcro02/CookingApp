import { UserPreferencesPayload } from '@shared/types/preferences';

export interface IdeasWorkerPayload {
    userId: string;
    taskID: string;
    ingredients: string[];
    preferences: UserPreferencesPayload;
}
