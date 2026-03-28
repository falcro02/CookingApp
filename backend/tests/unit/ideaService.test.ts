import { ideaService } from '../../src/services/ideaService';
import { ideaRepository } from '../../src/repositories/ideaRepository';
import { counterRepository } from '../../src/repositories/counterRepository';
import { taskRepository } from '../../src/repositories/taskRepository';
import { preferencesService } from '../../src/services/preferencesService';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

jest.mock('../../src/repositories/ideaRepository');
jest.mock('../../src/repositories/counterRepository');
jest.mock('../../src/repositories/taskRepository');
jest.mock('../../src/services/preferencesService');
jest.mock('@aws-sdk/client-lambda', () => {
    const mockSend = jest.fn();
    return {
        LambdaClient: jest.fn(() => ({
            send: mockSend,
        })),
        InvokeCommand: jest.fn(),
        __mockSend: mockSend,
    };
});

// @ts-ignore
const mockSend = require('@aws-sdk/client-lambda').__mockSend;

describe('ideaService', () => {
    const mockUserId = 'USER#123';

    beforeEach(() => {
        jest.clearAllMocks();
        mockSend.mockClear();
    });

    describe('getIdeas', () => {
        it('should return ideas for a user', async () => {
            const mockIdeas = [{ title: 'Pasta', ingredients: ['Tomato'] }];
            (ideaRepository.findByUser as jest.Mock).mockResolvedValue(mockIdeas);

            const result = await ideaService.getIdeas(mockUserId);

            expect(result).toEqual(mockIdeas);
            expect(ideaRepository.findByUser).toHaveBeenCalledWith(mockUserId);
        });

        it('should return empty array if no ideas found', async () => {
            (ideaRepository.findByUser as jest.Mock).mockResolvedValue(null);
            const result = await ideaService.getIdeas(mockUserId);
            expect(result).toEqual([]);
        });
    });

    describe('deleteIdeas', () => {
        it('should delete ideas for a user', async () => {
            await ideaService.deleteIdeas(mockUserId);
            expect(ideaRepository.delete).toHaveBeenCalledWith(mockUserId);
        });
    });

    describe('generateIdea', () => {
        const mockIngredients = ['Tomato', 'Basil'];
        const mockPrefs = { dietary: ['Vegan'], allergies: [], disliked: [] };

        it('should throw 429 if daily limit is reached', async () => {
            (counterRepository.getCount as jest.Mock).mockResolvedValue(3);

            try {
                await ideaService.generateIdea(mockUserId, 'some extra info');
                fail('Expected to throw limit reached error');
            } catch (error: any) {
                expect(error.message).toBe('Daily generation limit reached');
                expect(error.statusCode).toBe(429);
            }
        });

        it('should throw 409 if a task is already running', async () => {
            (counterRepository.getCount as jest.Mock).mockResolvedValue(1);
            (taskRepository.findRunningByUser as jest.Mock).mockResolvedValue({ taskID: 'running' });

            try {
                await ideaService.generateIdea(mockUserId, 'some extra info');
                fail('Expected to throw task running error');
            } catch (error: any) {
                expect(error.message).toBe('A generation task is already running');
                expect(error.statusCode).toBe(409);
            }
        });

        it('should create task and invoke worker successfully', async () => {
            (counterRepository.getCount as jest.Mock).mockResolvedValue(1);
            (taskRepository.findRunningByUser as jest.Mock).mockResolvedValue(null);
            (preferencesService.getPreferences as jest.Mock).mockResolvedValue(mockPrefs);

            jest.useFakeTimers().setSystemTime(new Date('2023-01-01T00:00:00Z'));
            const fixedDate = Date.now();

            const result = await ideaService.generateIdea(mockUserId, 'some extra info');

            expect(result).toBe(fixedDate.toString());

            expect(taskRepository.create).toHaveBeenCalledWith({
                PK: mockUserId,
                SK: `TASK#${fixedDate.toString()}`,
                taskID: fixedDate.toString(),
                status: 0,
                type: 'IDEA_GENERATION',
                createdAt: new Date(fixedDate).toISOString(),
                ttl: Math.floor(fixedDate / 1000) + 3600,
            });

            expect(InvokeCommand).toHaveBeenCalled();
            expect(mockSend).toHaveBeenCalled();

            jest.useRealTimers();
        });
    });
});
