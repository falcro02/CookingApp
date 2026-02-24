import { UserRepository } from "../databases/userRepository";
import { UserPreferences, UpdatePreferencesInput } from "../models/preferences";

export class PreferencesService {
    private repository: UserRepository;

    constructor() {
        this.repository = new UserRepository();
    }

    async getPreferences(userId: string): Promise<UserPreferences> {
        const prefs = await this.repository.getPreferences(userId);
        if (!prefs) {
            // Return default preferences if none exist
            return {
                PK: userId,
                SK: "PREFERENCES",
                dietaryRestrictions: [],
                allergies: [],
                dislikedIngredients: [],
                servingSize: 2,
                updatedAt: new Date().toISOString()
            };
        }
        return prefs;
    }

    async updatePreferences(userId: string, input: UpdatePreferencesInput): Promise<UserPreferences> {
        const current = await this.getPreferences(userId);
        const updated: UserPreferences = {
            ...current,
            ...input,
            updatedAt: new Date().toISOString()
        };
        await this.repository.savePreferences(updated);
        return updated;
    }
}
