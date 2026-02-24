import { PantryRepository } from "../databases/pantryRepository";
import { CreatePantryItemInput, PantryItem } from "../models/pantry";

export class PantryService {
    private repository: PantryRepository;

    constructor() {
        this.repository = new PantryRepository();
    }

    async getPantryItems(userId: string): Promise<PantryItem[]> {
        return await this.repository.findAllByUserId(userId);
    }

    async addPantryItem(userId: string, input: CreatePantryItemInput): Promise<PantryItem> {
        // Simple ID generation - can be replaced with UUID
        const itemId = Date.now().toString();
        const item: PantryItem = {
            PK: userId,
            SK: `ITEM#${itemId}`,
            name: input.name,
            quantity: input.quantity,
            unit: input.unit,
            updatedAt: new Date().toISOString()
        };
        await this.repository.save(item);
        return item;
    }

    async deletePantryItem(userId: string, itemId: string): Promise<void> {
        await this.repository.delete(userId, itemId);
    }
}
