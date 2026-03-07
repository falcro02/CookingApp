import { pantryRepository } from '../repositories/pantryRepository';
import { CreatePantryItemInput, PantryItem } from '../models/pantry';

export const pantryService = {
    async getPantryItems(userId: string): Promise<PantryItem[]> {
        return await pantryRepository.findAllByUserId(userId);
    },

    async addPantryItem(userId: string, input: CreatePantryItemInput): Promise<PantryItem> {
        const itemId = Date.now().toString();
        const item: PantryItem = {
            PK: userId,
            SK: `ITEM#${itemId}`,
            name: input.name,
            quantity: input.quantity,
        };
        await pantryRepository.save(item);
        return item;
    },

    async deletePantryItem(userId: string, itemId: string): Promise<void> {
        await pantryRepository.delete(userId, itemId);
    },
};
