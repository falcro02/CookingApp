import { pantryService } from '../../src/services/pantryService';
import { pantryRepository } from '../../src/repositories/pantryRepository';

jest.mock('../../src/repositories/pantryRepository');

describe('pantryService', () => {
    const mockUserId = 'USER#123';

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getPantryItems', () => {
        it('should return pantry items for a user', async () => {
            const mockItems = [{ name: 'Rice', quantity: '1kg', PK: mockUserId, SK: 'ITEM#1' }];
            (pantryRepository.findAllByUserId as jest.Mock).mockResolvedValue(mockItems);

            const result = await pantryService.getPantryItems(mockUserId);
            expect(result).toEqual(mockItems);
            expect(pantryRepository.findAllByUserId).toHaveBeenCalledWith(mockUserId);
        });
    });

    describe('addPantryItem', () => {
        it('should add a pantry item and return the item entity', async () => {
            const input = { name: 'Pasta', quantity: '500g' };
            const fixedDate = new Date('2023-01-01T00:00:00Z').getTime();
            jest.spyOn(Date, 'now').mockReturnValue(fixedDate);

            const result = await pantryService.addPantryItem(mockUserId, input);

            const expectedItem = {
                PK: mockUserId,
                SK: `ITEM#${fixedDate.toString()}`,
                name: 'Pasta',
                quantity: '500g',
            };

            expect(result).toEqual(expectedItem);
            expect(pantryRepository.save).toHaveBeenCalledWith(expectedItem);

            jest.restoreAllMocks();
        });
    });

    describe('deletePantryItem', () => {
        it('should delete a pantry item', async () => {
            await pantryService.deletePantryItem(mockUserId, 'ITEM#1');
            expect(pantryRepository.delete).toHaveBeenCalledWith(mockUserId, 'ITEM#1');
        });
    });
});
