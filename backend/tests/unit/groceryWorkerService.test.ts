import { groceryWorkerService } from '../../src/services/groceryWorkerService';
import { mealRepository } from '../../src/repositories/mealRepository';
import { groceryRepository } from '../../src/repositories/groceryRepository';
import { taskRepository } from '../../src/repositories/taskRepository';
import { preferenceRepository } from '../../src/repositories/preferenceRepository';
import { counterRepository } from '../../src/repositories/counterRepository';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

jest.mock('../../src/repositories/mealRepository');
jest.mock('../../src/repositories/groceryRepository');
jest.mock('../../src/repositories/taskRepository');
jest.mock('../../src/repositories/preferenceRepository');
jest.mock('../../src/repositories/counterRepository');
jest.mock('@aws-sdk/client-bedrock-runtime', () => {
    const mockSend = jest.fn();
    return {
        BedrockRuntimeClient: jest.fn(() => ({
            send: mockSend,
        })),
        InvokeModelCommand: jest.fn(),
        __mockSend: mockSend
    };
});

// @ts-ignore
const mockSend = require('@aws-sdk/client-bedrock-runtime').__mockSend;

describe('groceryWorkerService', () => {
    const mockUserId = 'USER#123';
    const mockTaskId = 'TASK#456';
    
    afterEach(() => {
        jest.restoreAllMocks();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockSend.mockClear();
    });

    describe('execute', () => {
        const payload = {
            userId: mockUserId,
            taskID: mockTaskId,
            days: [0, 3],
            plan: 1,
            unplanned: ['Apples'],
            extra: 'Buy local',
            replace: true,
        };

        it('should execute successfully and replace items', async () => {
            (mealRepository.findByPlan as jest.Mock).mockResolvedValue([
                { description: 'Pasta', weekDay: 1 }
            ]);
            (preferenceRepository.getPreferences as jest.Mock).mockResolvedValue(null);

            // Mock callBedrock which is called internally
            jest.spyOn(groceryWorkerService, 'callBedrock').mockResolvedValue(
                '[{"description": "Pasta 500g", "weekDay": 0}]'
            );

            // Mock Date for consistent item IDs
            const fixedDate = new Date('2023-01-01T00:00:00Z').getTime();
            jest.spyOn(Date, 'now').mockReturnValue(fixedDate);

            await groceryWorkerService.execute(payload);

            expect(mealRepository.findByPlan).toHaveBeenCalledWith(mockUserId, 1);
            expect(preferenceRepository.getPreferences).toHaveBeenCalledWith(mockUserId);
            expect(groceryWorkerService.callBedrock).toHaveBeenCalled();
            expect(groceryRepository.deleteAllByUser).toHaveBeenCalledWith(mockUserId);
            
            expect(groceryRepository.batchCreate).toHaveBeenCalledWith([{
                PK: mockUserId,
                SK: `GROCERY#${fixedDate}_0`,
                itemID: `${fixedDate}_0`,
                description: 'Pasta 500g',
                weekDay: 0,
                checked: false,
            }]);
            
            expect(counterRepository.incrementCount).toHaveBeenCalled();
            expect(taskRepository.updateStatus).toHaveBeenCalledWith(mockUserId, mockTaskId, 1);
        });

        it('should handle errors and update task status to -1', async () => {
             const errorMsg = 'Failed to fetch meals';
             (mealRepository.findByPlan as jest.Mock).mockRejectedValue(new Error(errorMsg));

             await groceryWorkerService.execute(payload);

             expect(taskRepository.updateStatus).toHaveBeenCalledWith(mockUserId, mockTaskId, -1, errorMsg);
        });
    });

    describe('buildPrompt', () => {
        it('should build a prompt with preferences and extra instructions', () => {
            const meals: any = [{ description: 'Pasta', weekDay: 1 }];
            const preferences: any = { dietary: 'Vegan', allergies: 'Peanuts', disliked: 'Mushrooms' };
            const prompt = groceryWorkerService.buildPrompt(meals, ['Apples'], [0, 3], preferences, 'Buy local');

            expect(prompt).toContain('Pasta');
            expect(prompt).toContain('Apples');
            expect(prompt).toContain('Vegan');
            expect(prompt).toContain('Peanuts');
            expect(prompt).toContain('Mushrooms');
            expect(prompt).toContain('Buy local');
        });
    });

    describe('callBedrock', () => {
        it('should invoke Bedrock model', async () => {
            const mockResponse = {
                body: new TextEncoder().encode(JSON.stringify({
                    content: [{ text: 'response text' }]
                }))
            };
            mockSend.mockResolvedValue(mockResponse);

            const result = await groceryWorkerService.callBedrock('test prompt');
            expect(result).toBe('response text');
            expect(InvokeModelCommand).toHaveBeenCalled();
        });
    });

    describe('parseAiResponse', () => {
        it('should parse valid JSON array', () => {
            const raw = '```json\n[{"description": "Milk 1L", "weekDay": 0}]\n```';
            const parsed = groceryWorkerService.parseAiResponse(raw);
            expect(parsed).toEqual([{ description: 'Milk 1L', weekDay: 0 }]);
        });

        it('should throw an error if response is not an array', () => {
            const raw = '{"description": "Milk 1L", "weekDay": 0}';
             expect(() => groceryWorkerService.parseAiResponse(raw)).toThrow('AI response is not an array');
        });
    });
});
