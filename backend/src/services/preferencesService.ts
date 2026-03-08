import { preferenceRepository } from '../repositories/preferenceRepository';
import { UserPreferences, UpdatePreferencesInput } from '../models/preferences';

export const preferencesService = {
    async getPreferences(userId: string): Promise<UserPreferences> {
        const prefs = await preferenceRepository.getPreferences(userId);
        if (!prefs) {
            return {
                PK: userId,
                SK: 'PREFERENCES',
                dietaryRestrictions: [],
                allergies: [],
                dislikedIngredients: [],
                servingSize: 2,
                updatedAt: new Date().toISOString(),
            };
        }
        return prefs;
    },

    async updatePreferences(userId: string, input: UpdatePreferencesInput): Promise<UserPreferences> {
        const current = await this.getPreferences(userId);
        const updated: UserPreferences = {
            ...current,
            ...(input.dietaryRestrictions !== undefined && { dietaryRestrictions: input.dietaryRestrictions }),
            ...(input.allergies !== undefined && { allergies: input.allergies }),
            ...(input.dislikedIngredients !== undefined && { dislikedIngredients: input.dislikedIngredients }),
            ...(input.servingSize !== undefined && { servingSize: input.servingSize }),
            updatedAt: new Date().toISOString(),
        };
        await preferenceRepository.savePreferences(updated);
        return updated;
    },
};
