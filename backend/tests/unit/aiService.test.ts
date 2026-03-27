import { AiService } from '../../src/services/aiService';

describe('aiService', () => {
    let aiService: AiService;

    beforeEach(() => {
        aiService = new AiService();
    });

    describe('generateRecipe', () => {
        it('should return a placeholder mock recipe response', async () => {
            const request = { ingredients: ['Tomato', 'Basil'] };
            const result = await aiService.generateRecipe(request);

            expect(result).toEqual({
                recipeName: 'AI Suggested Meal',
                description: 'A delicious meal generated based on your ingredients.',
                ingredients: ['Tomato', 'Basil'],
                instructions: ['Mix ingredients.', 'Cook for 20 minutes.', 'Serve hot.'],
                estimatedTime: '30 mins',
            });
        });
    });
});
