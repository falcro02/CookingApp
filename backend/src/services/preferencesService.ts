import { preferenceRepository } from '../repositories/preferenceRepository';
import { UserPreferencesEntity } from '../entities/preferenceEntity';
import { UpdatePreferencesInput, PreferencesState } from '@shared/types/preferences';

export const preferencesService = {
    async getPreferences(userId: string): Promise<PreferencesState> {
        const prefs = await preferenceRepository.getPreferences(userId);
        if (!prefs) {
            return {
                preferences: {
                    dietary: '',
                    allergies: '',
                    disliked: '',
                },
            };
        }
        return {
            preferences: {
                dietary: prefs.dietary,
                allergies: prefs.allergies,
                disliked: prefs.disliked,
            },
        };
    },

    async updatePreferences(userId: string, input: UpdatePreferencesInput): Promise<UserPreferencesEntity> {
        const current = (await preferenceRepository.getPreferences(userId)) || {
            PK: userId,
            SK: 'PREFERENCES',
            dietary: '',
            allergies: '',
            disliked: '',
            updatedAt: new Date().toISOString(),
        };
        const prefs = input.preferences || {};
        const updated: UserPreferencesEntity = {
            ...current,
            ...(prefs.dietary !== undefined && { dietary: prefs.dietary }),
            ...(prefs.allergies !== undefined && { allergies: prefs.allergies }),
            ...(prefs.disliked !== undefined && { disliked: prefs.disliked }),
            updatedAt: new Date().toISOString(),
        };
        await preferenceRepository.savePreferences(updated);
        return updated;
    },
};
