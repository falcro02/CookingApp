import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockGetPreferences = jest.fn<(...args: any[]) => any>();
const mockSavePreferences = jest.fn<(...args: any[]) => any>();

jest.mock('../../src/repositories/preferenceRepository', () => ({
    preferenceRepository: {
        getPreferences: (...args: any[]) => mockGetPreferences(...args),
        savePreferences: (...args: any[]) => mockSavePreferences(...args),
    },
}));

import { preferencesService } from '../../src/services/preferencesService';
import { UpdatePreferencesInput } from '@shared/types/preferences';

describe('preferencesService', () => {
    const userId = 'USER#test-user';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getPreferences', () => {
        it('returns default preferences if none exist in DB', async () => {
            mockGetPreferences.mockResolvedValue(null);

            const result = await preferencesService.getPreferences(userId);
            expect(result).toEqual({
                preferences: {
                    dietary: '',
                    allergies: '',
                    disliked: '',
                },
            });
        });

        it('returns stored preferences from repository', async () => {
            const mockStored = {
                PK: userId,
                SK: 'PREFERENCES',
                dietary: 'vegan',
                allergies: 'nuts',
                disliked: 'onions',
                updatedAt: '2023-01-01',
            };
            mockGetPreferences.mockResolvedValue(mockStored);

            const result = await preferencesService.getPreferences(userId);
            expect(result).toEqual({
                preferences: {
                    dietary: 'vegan',
                    allergies: 'nuts',
                    disliked: 'onions',
                },
            });
        });
    });

    describe('updatePreferences', () => {
        it('merges new preferences with existing ones', async () => {
            const current = {
                PK: userId,
                SK: 'PREFERENCES',
                dietary: 'vegetarian',
                allergies: 'peanuts',
                disliked: 'garlic',
                updatedAt: '2023-01-01',
            };
            mockGetPreferences.mockResolvedValue(current);

            const input: UpdatePreferencesInput = {
                preferences: {
                    dietary: 'vegan',
                    // allergies omitted, should remain peanuts
                    disliked: '', // explicitly cleared
                },
            };

            await preferencesService.updatePreferences(userId, input);

            expect(mockSavePreferences).toHaveBeenCalledWith(
                expect.objectContaining({
                    PK: userId,
                    dietary: 'vegan',
                    allergies: 'peanuts',
                    disliked: '',
                    updatedAt: expect.any(String),
                }),
            );
        });

        it('creates new preferences if none exist', async () => {
            mockGetPreferences.mockResolvedValue(null);

            const input: UpdatePreferencesInput = {
                preferences: {
                    dietary: 'none',
                    allergies: 'none',
                    disliked: 'none',
                },
            };

            await preferencesService.updatePreferences(userId, input);

            expect(mockSavePreferences).toHaveBeenCalledWith(
                expect.objectContaining({
                    PK: userId,
                    dietary: 'none',
                    allergies: 'none',
                    disliked: 'none',
                }),
            );
        });
    });
});
