import { ideaWorkerService } from '../../src/services/ideaWorkerService';
import { ideaRepository } from '../../src/repositories/ideaRepository';
import { taskRepository } from '../../src/repositories/taskRepository';
import { counterRepository } from '../../src/repositories/counterRepository';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

jest.mock('../../src/repositories/ideaRepository');
jest.mock('../../src/repositories/taskRepository');
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

describe('ideaWorkerService', () => {
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
            ingredients: ['Tomato', 'Pasta'],
            preferences: { dietary: 'Vegan', allergies: '', disliked: '' },
        };

        it('should execute successfully and save new ideas', async () => {
            jest.spyOn(ideaWorkerService, 'callBedrock').mockResolvedValue(
                '[{"name": "Pasta Pomodoro", "story": "Boil pasta.", "icon": "🍝"}]'
            );

            await ideaWorkerService.execute(payload);

            expect(ideaWorkerService.callBedrock).toHaveBeenCalled();
            expect(ideaRepository.delete).toHaveBeenCalledWith(mockUserId);
            expect(ideaRepository.save).toHaveBeenCalledWith(mockUserId, [
                { name: 'Pasta Pomodoro', story: 'Boil pasta.', icon: '🍝' }
            ]);
            expect(counterRepository.incrementCount).toHaveBeenCalled();
            expect(taskRepository.updateStatus).toHaveBeenCalledWith(mockUserId, mockTaskId, 1);
        });

        it('should handle errors and update task status to -1', async () => {
             const errorMsg = 'Failed to fetch AI';
             jest.spyOn(ideaWorkerService, 'callBedrock').mockRejectedValue(new Error(errorMsg));

             await ideaWorkerService.execute(payload);

             expect(taskRepository.updateStatus).toHaveBeenCalledWith(mockUserId, mockTaskId, -1, errorMsg);
        });
    });

    describe('buildPrompt', () => {
        it('should build a prompt with preferences and ingredients', () => {
            const ingredients = ['Tomato'];
            const preferences = { dietary: 'Vegan', allergies: 'Peanuts', disliked: 'Mushrooms' };
            const prompt = ideaWorkerService.buildPrompt(ingredients, preferences);

            expect(prompt).toContain('Tomato');
            expect(prompt).toContain('Vegan');
            expect(prompt).toContain('Peanuts');
            expect(prompt).toContain('Mushrooms');
        });
    });

    describe('callBedrock', () => {
        it('should invoke Bedrock model', async () => {
            const mockResponse = {
                body: new TextEncoder().encode(JSON.stringify({
                    content: [{ text: 'idea response' }]
                }))
            };
            mockSend.mockResolvedValue(mockResponse);

            const result = await ideaWorkerService.callBedrock('idea test prompt');
            expect(result).toBe('idea response');
            expect(InvokeModelCommand).toHaveBeenCalled();
        });
    });

    describe('parseAiResponse', () => {
        it('should parse valid JSON array', () => {
            const raw = '```json\n[{"name": "Soup", "story": "Hot soup", "icon": "🍲"}]\n```';
            const parsed = ideaWorkerService.parseAiResponse(raw);
            expect(parsed).toEqual([{ name: 'Soup', story: 'Hot soup', icon: '🍲' }]);
        });

        it('should throw an error if response is not an array', () => {
            const raw = '{"name": "Soup", "story": "Hot soup", "icon": "🍲"}';
             expect(() => ideaWorkerService.parseAiResponse(raw)).toThrow('AI response is not an array');
        });
    });
});
