import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// --- Mocks ---

const mockFindAllByUser = jest.fn<(...args: any[]) => any>();
const mockCreate = jest.fn<(...args: any[]) => any>();
const mockFindById = jest.fn<(...args: any[]) => any>();
const mockDelete = jest.fn<(...args: any[]) => any>();
const mockDeleteAllByUser = jest.fn<(...args: any[]) => any>();
const mockUpdate = jest.fn<(...args: any[]) => any>();
const mockUpdateAllChecked = jest.fn<(...args: any[]) => any>();
const mockGetGenerationCount = jest.fn<(...args: any[]) => any>();
const mockBatchCreate = jest.fn<(...args: any[]) => any>();
const mockIncrementGenerationCount = jest.fn<(...args: any[]) => any>();

jest.mock('../../src/repositories/groceryRepository', () => ({
    groceryRepository: {
        findAllByUser: (...args: any[]) => mockFindAllByUser(...args),
        create: (...args: any[]) => mockCreate(...args),
        findById: (...args: any[]) => mockFindById(...args),
        delete: (...args: any[]) => mockDelete(...args),
        deleteAllByUser: (...args: any[]) => mockDeleteAllByUser(...args),
        update: (...args: any[]) => mockUpdate(...args),
        updateAllChecked: (...args: any[]) => mockUpdateAllChecked(...args),
        getGenerationCount: (...args: any[]) => mockGetGenerationCount(...args),
        batchCreate: (...args: any[]) => mockBatchCreate(...args),
        incrementGenerationCount: (...args: any[]) => mockIncrementGenerationCount(...args),
    },
}));

const mockTaskCreate = jest.fn<(...args: any[]) => any>();
const mockFindRunningByUser = jest.fn<(...args: any[]) => any>();

jest.mock('../../src/repositories/taskRepository', () => ({
    taskRepository: {
        create: (...args: any[]) => mockTaskCreate(...args),
        findRunningByUser: (...args: any[]) => mockFindRunningByUser(...args),
    },
}));

const mockFindByPlan = jest.fn<(...args: any[]) => any>();

jest.mock('../../src/repositories/mealRepository', () => ({
    mealRepository: {
        findByPlan: (...args: any[]) => mockFindByPlan(...args),
    },
}));

const mockLambdaSend = jest.fn<(...args: any[]) => any>();

jest.mock('@aws-sdk/client-lambda', () => ({
    LambdaClient: jest.fn().mockImplementation(() => ({ send: mockLambdaSend })),
    InvokeCommand: jest.fn().mockImplementation((params: any) => params),
}));

import { groceryService } from '../../src/services/groceryService';

const USER_ID = 'USER#test-user';

describe('groceryService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // --- getGroceries ---

    describe('getGroceries', () => {
        it('returns groceries as a dictionary', async () => {
            mockFindAllByUser.mockResolvedValue([
                { itemID: '1', description: 'Chicken - 1kg', weekDay: 0, checked: false },
                { itemID: '2', description: 'Pasta - 500g', weekDay: 2, checked: true },
            ]);
            const result = await groceryService.getGroceries(USER_ID);
            expect(result).toEqual({
                '1': { description: 'Chicken - 1kg', weekDay: 0, checked: false },
                '2': { description: 'Pasta - 500g', weekDay: 2, checked: true },
            });
            expect(mockFindAllByUser).toHaveBeenCalledWith(USER_ID);
        });

        it('returns empty object when no groceries', async () => {
            mockFindAllByUser.mockResolvedValue([]);
            const result = await groceryService.getGroceries(USER_ID);
            expect(result).toEqual({});
        });
    });

    // --- createGrocery ---

    describe('createGrocery', () => {
        it('creates a grocery item and returns itemID', async () => {
            mockCreate.mockResolvedValue(undefined);
            const itemID = await groceryService.createGrocery(USER_ID, { description: 'Milk - 1L', weekDay: 1 });
            expect(typeof itemID).toBe('string');
            expect(mockCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    PK: USER_ID,
                    description: 'Milk - 1L',
                    weekDay: 1,
                    checked: false,
                }),
            );
        });

        it('throws on missing description', async () => {
            await expect(groceryService.createGrocery(USER_ID, { description: '', weekDay: 1 })).rejects.toThrow(
                'invalid description',
            );
        });

        it('throws on invalid weekDay', async () => {
            await expect(groceryService.createGrocery(USER_ID, { description: 'Milk', weekDay: 7 })).rejects.toThrow(
                'invalid week day',
            );
        });

        it('throws on negative weekDay', async () => {
            await expect(groceryService.createGrocery(USER_ID, { description: 'Milk', weekDay: -1 })).rejects.toThrow(
                'invalid week day',
            );
        });
    });

    // --- clearGroceries ---

    describe('clearGroceries', () => {
        it('calls deleteAllByUser', async () => {
            mockDeleteAllByUser.mockResolvedValue(undefined);
            await groceryService.clearGroceries(USER_ID);
            expect(mockDeleteAllByUser).toHaveBeenCalledWith(USER_ID);
        });
    });

    // --- deleteGrocery ---

    describe('deleteGrocery', () => {
        it('deletes an existing item', async () => {
            mockFindById.mockResolvedValue({ itemID: '123' });
            mockDelete.mockResolvedValue(undefined);
            await groceryService.deleteGrocery(USER_ID, '123');
            expect(mockDelete).toHaveBeenCalledWith(USER_ID, '123');
        });

        it('throws when item not found', async () => {
            mockFindById.mockResolvedValue(null);
            await expect(groceryService.deleteGrocery(USER_ID, 'nonexistent')).rejects.toThrow('item not found');
        });
    });

    // --- updateGrocery ---

    describe('updateGrocery', () => {
        it('updates description', async () => {
            mockFindById.mockResolvedValue({ itemID: '123' });
            mockUpdate.mockResolvedValue(undefined);
            await groceryService.updateGrocery(USER_ID, '123', { description: 'New desc' });
            expect(mockUpdate).toHaveBeenCalledWith(USER_ID, '123', { description: 'New desc' });
        });

        it('updates checked field', async () => {
            mockFindById.mockResolvedValue({ itemID: '123' });
            mockUpdate.mockResolvedValue(undefined);
            await groceryService.updateGrocery(USER_ID, '123', { checked: true });
            expect(mockUpdate).toHaveBeenCalledWith(USER_ID, '123', { checked: true });
        });

        it('does nothing when no fields provided', async () => {
            await groceryService.updateGrocery(USER_ID, '123', {});
            expect(mockFindById).not.toHaveBeenCalled();
            expect(mockUpdate).not.toHaveBeenCalled();
        });

        it('throws when item not found', async () => {
            mockFindById.mockResolvedValue(null);
            await expect(groceryService.updateGrocery(USER_ID, 'nonexistent', { checked: true })).rejects.toThrow(
                'item not found',
            );
        });

        it('throws on invalid description type', async () => {
            await expect(groceryService.updateGrocery(USER_ID, '123', { description: 123 as any })).rejects.toThrow(
                'invalid description',
            );
        });

        it('throws on invalid checked type', async () => {
            await expect(groceryService.updateGrocery(USER_ID, '123', { checked: 'yes' as any })).rejects.toThrow(
                'invalid checked field',
            );
        });
    });

    // --- checkAll ---

    describe('checkAll', () => {
        it('checks all items', async () => {
            mockUpdateAllChecked.mockResolvedValue(undefined);
            await groceryService.checkAll(USER_ID, true);
            expect(mockUpdateAllChecked).toHaveBeenCalledWith(USER_ID, true);
        });

        it('unchecks all items', async () => {
            mockUpdateAllChecked.mockResolvedValue(undefined);
            await groceryService.checkAll(USER_ID, false);
            expect(mockUpdateAllChecked).toHaveBeenCalledWith(USER_ID, false);
        });

        it('throws on invalid check type', async () => {
            await expect(groceryService.checkAll(USER_ID, 'yes' as any)).rejects.toThrow('invalid check field');
        });
    });

    // --- generateGroceries ---

    describe('generateGroceries', () => {
        const validRequest = {
            days: [0, 1, 2],
            plan: 1,
            unplanned: ['Snacks'],
            extra: 'Buy organic',
            replace: true,
        };

        it('creates task and invokes worker on success', async () => {
            mockGetGenerationCount.mockResolvedValue(0);
            mockFindRunningByUser.mockResolvedValue(null);
            mockFindByPlan.mockResolvedValue([{ description: 'Chicken' }]);
            mockTaskCreate.mockResolvedValue(undefined);
            mockLambdaSend.mockResolvedValue(undefined);

            const taskID = await groceryService.generateGroceries(USER_ID, validRequest);
            expect(typeof taskID).toBe('string');
            expect(mockTaskCreate).toHaveBeenCalled();
            expect(mockLambdaSend).toHaveBeenCalled();
        });

        it('throws 429 when daily limit reached', async () => {
            mockGetGenerationCount.mockResolvedValue(3);
            await expect(groceryService.generateGroceries(USER_ID, validRequest)).rejects.toMatchObject({
                statusCode: 429,
                message: expect.stringContaining('Daily generation limit'),
            });
        });

        it('throws 409 when task already running', async () => {
            mockGetGenerationCount.mockResolvedValue(0);
            mockFindRunningByUser.mockResolvedValue({ taskID: 'running-task', status: 0 });
            await expect(groceryService.generateGroceries(USER_ID, validRequest)).rejects.toMatchObject({
                statusCode: 409,
            });
        });

        it('throws 404 when no meals in plan', async () => {
            mockGetGenerationCount.mockResolvedValue(0);
            mockFindRunningByUser.mockResolvedValue(null);
            mockFindByPlan.mockResolvedValue([]);
            await expect(groceryService.generateGroceries(USER_ID, validRequest)).rejects.toMatchObject({
                statusCode: 404,
            });
        });
    });

    // --- validateGenerateRequest ---

    describe('validateGenerateRequest', () => {
        it('passes with valid request', () => {
            expect(() =>
                groceryService.validateGenerateRequest({
                    days: [0, 1],
                    plan: 1,
                    unplanned: [],
                    extra: '',
                    replace: false,
                }),
            ).not.toThrow();
        });

        it('throws on empty days', () => {
            expect(() =>
                groceryService.validateGenerateRequest({
                    days: [],
                    plan: 1,
                    unplanned: [],
                    extra: '',
                    replace: false,
                }),
            ).toThrow('days must be a non-empty array');
        });

        it('throws on invalid day value', () => {
            expect(() =>
                groceryService.validateGenerateRequest({
                    days: [7],
                    plan: 1,
                    unplanned: [],
                    extra: '',
                    replace: false,
                }),
            ).toThrow('each day must be an integer between 0 and 6');
        });

        it('throws on invalid plan', () => {
            expect(() =>
                groceryService.validateGenerateRequest({
                    days: [0],
                    plan: 5,
                    unplanned: [],
                    extra: '',
                    replace: false,
                }),
            ).toThrow('plan must be an integer between 1 and 4');
        });

        it('throws on non-array unplanned', () => {
            expect(() =>
                groceryService.validateGenerateRequest({
                    days: [0],
                    plan: 1,
                    unplanned: 'test' as any,
                    extra: '',
                    replace: false,
                }),
            ).toThrow('unplanned must be an array');
        });

        it('throws on non-string extra', () => {
            expect(() =>
                groceryService.validateGenerateRequest({
                    days: [0],
                    plan: 1,
                    unplanned: [],
                    extra: 123 as any,
                    replace: false,
                }),
            ).toThrow('extra must be a string');
        });

        it('throws on non-boolean replace', () => {
            expect(() =>
                groceryService.validateGenerateRequest({
                    days: [0],
                    plan: 1,
                    unplanned: [],
                    extra: '',
                    replace: 'yes' as any,
                }),
            ).toThrow('replace must be a boolean');
        });
    });
});
