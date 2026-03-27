import { ingredientsRepository, IngredientEntity } from '../repositories/ingredientsRepository';
import { IngredientItem, IngredientsState } from '@shared/types/ingredients';
import { groceryRepository } from '../repositories/groceryRepository';

export const ingredientsService = {
    async getIngredients(userId: string): Promise<IngredientsState> {
        const items = await ingredientsRepository.findAllByUserId(userId);
        const ingredients: any = {};
        
        items.forEach(item => {
            const id = item.SK.replace('INGREDIENT#', '');
            ingredients[id] = { description: item.description };
        });

        return { ingredients };
    },

    async addIngredient(userId: string, input: IngredientItem): Promise<{ itemId: string }> {
        const itemId = Date.now().toString();
        const item: IngredientEntity = {
            PK: userId,
            SK: `INGREDIENT#${itemId}`,
            description: input.description,
        };
        await ingredientsRepository.save(item);
        return { itemId };
    },

    async updateIngredient(userId: string, itemId: string, input: Partial<IngredientItem>): Promise<void> {
        const items = await ingredientsRepository.findAllByUserId(userId);
        const existing = items.find(i => i.SK === `INGREDIENT#${itemId}`);
        
        if (existing) {
            const updated: IngredientEntity = {
                ...existing,
                description: input.description || existing.description,
            };
            await ingredientsRepository.save(updated);
        }
    },

    async deleteIngredient(userId: string, itemId: string): Promise<void> {
        await ingredientsRepository.delete(userId, itemId);
    },

    async clearIngredients(userId: string): Promise<void> {
        await ingredientsRepository.deleteAll(userId);
    },

    async importFromGroceries(userId: string): Promise<void> {
        // Prendi tutte le grocery che hanno il check a true
        const groceries = await groceryRepository.findAllByUser(userId);
        const checkedItems = groceries.filter((g: any) => g.checked);
        
        // Prendi gli ingredienti attuali per evitare duplicati
        const existingIngredients = await ingredientsRepository.findAllByUserId(userId);
        const existingDescriptions = new Set(existingIngredients.map(i => i.description.toLowerCase()));

        for (const grocery of checkedItems) {
            if (!existingDescriptions.has(grocery.description.toLowerCase())) {
                await this.addIngredient(userId, { description: grocery.description });
                existingDescriptions.add(grocery.description.toLowerCase());
            }
        }
    }
};
