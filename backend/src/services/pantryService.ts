import { pantryRepository } from '../repositories/pantryRepository';
import { PantryItemEntity } from '../entities/pantryEntity';
import { CreatePantryItemInput } from '@shared/types/pantry';

export const pantryService = {
    async getPantryItems(userId: string): Promise<PantryItemEntity[]> {
        return await pantryRepository.findAllByUserId(userId);
    },

    async addPantryItem(userId: string, input: CreatePantryItemInput): Promise<PantryItemEntity> {
        const itemId = Date.now().toString();
        const item: PantryItemEntity = {
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
