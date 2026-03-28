import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { ideaRepository } from '../repositories/ideaRepository';
import { taskRepository } from '../repositories/taskRepository';
import { counterRepository } from '../repositories/counterRepository';
import { IdeasWorkerPayload } from '../dto/ideaDto';
import { UserPreferencesPayload } from '@shared/types/preferences';
import { IdeaItem } from '@shared/types/ideas';

const bedrockClient = new BedrockRuntimeClient({});

const MODEL_ID = 'eu.anthropic.claude-haiku-4-5-20251001-v1:0';

export const ideaWorkerService = {
    async execute(payload: IdeasWorkerPayload): Promise<void> {
        const { userId, taskId, ingredients, preferences, extra } = payload;

        try {
            // 1. Build the prompt
            const prompt = this.buildPrompt(ingredients, preferences, extra);

            // 2. Call Bedrock
            const aiResponse = await this.callBedrock(prompt);

            // 3. Parse AI response
            const ideas: IdeaItem[] = this.parseAiResponse(aiResponse);

            // 4. Delete old ideas
            await ideaRepository.delete(userId);

            // 5. Save new ideas
            await ideaRepository.save(userId, ideas);

            // 6. Increment daily generation counter
            const today = new Date().toISOString().split('T')[0];
            await counterRepository.incrementCount(userId, today);

            // 7. Mark task as completed
            await taskRepository.updateStatus(userId, taskId, 1);
        } catch (error: any) {
            console.error('IdeaItemWorker FAILED:', error);
            await taskRepository.updateStatus(userId, taskId, -1, error.message || 'Unknown error');
        }
    },

    buildPrompt(ingredients: string[], preferences: UserPreferencesPayload, extra: string): string {
        const ingredientList = ingredients.map((i) => `- ${i}`).join('\n');

        let preferencesBlock = 'No preferences set.';
        const parts: string[] = [];
        if (preferences.dietary.trim().length > 0) {
            parts.push(`Dietary restrictions: ${preferences.dietary}`);
        }
        if (preferences.allergies.trim().length > 0) {
            parts.push(`Allergies (MUST AVOID): ${preferences.allergies}`);
        }
        if (preferences.disliked.trim().length > 0) {
            parts.push(`Disliked ingredients (avoid if possible): ${preferences.disliked}`);
        }
        if (parts.length > 0) {
            preferencesBlock = parts.join('\n');
        }

        const extraBlock = extra.trim() ? `Additional instructions from the user:\n${extra}` : '';

        return `You are a creative cooking assistant. Based on the available ingredients and the user's preferences, suggest meal ideas that can be prepared.

AVAILABLE INGREDIENTS:
${ingredientList}

USER PREFERENCES:
${preferencesBlock}

${extraBlock}

INSTRUCTIONS:
- Suggest 3 to 5 meal ideas that can be made primarily with the listed ingredients.
- Each idea should have a short, catchy name.
- Each idea should have a story that briefly describes the dish AND explains how to prepare it step by step in a concise way.
- Each idea should have an icon (a single emoji that best represents the dish).
- Be creative but realistic — the meals should be achievable with the given ingredients.
- Respect all allergies strictly — never suggest a meal containing allergens.
- Respect dietary restrictions (e.g., no meat for vegetarian).
- Avoid disliked ingredients where possible.

Respond ONLY with a valid JSON array. Each element must have exactly these fields:
- "name": string (short catchy meal name)
- "story": string (description of the dish followed by brief preparation steps)
- "icon": string (a single emoji)

Example response format:
[
  {"name": "Mediterranean Pasta", "story": "A light and fresh pasta tossed with tomato sauce, olive oil, and aromatic spices. Boil the pasta until al dente, heat the tomato sauce with a drizzle of oil and your favourite spices, then toss everything together and serve hot.", "icon": "🍝"},
  {"name": "Hearty Lentil Soup", "story": "A warm and comforting soup made with lentils, onions, and spices. Sauté diced onions in oil until golden, add lentils and water, season with spices, and simmer for 25 minutes until tender.", "icon": "🍲"}
]

Do not include any text before or after the JSON array.`;
    },

    async callBedrock(prompt: string): Promise<string> {
        const requestBody = {
            anthropic_version: 'bedrock-2023-05-31',
            max_tokens: 4096,
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
        };

        const command = new InvokeModelCommand({
            modelId: MODEL_ID,
            contentType: 'application/json',
            accept: 'application/json',
            body: JSON.stringify(requestBody),
        });

        const response = await bedrockClient.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));

        return responseBody.content[0].text;
    },

    parseAiResponse(responseText: string): IdeaItem[] {
        let cleaned = responseText.trim();

        // Remove markdown code fences if present
        if (cleaned.startsWith('```json')) {
            cleaned = cleaned.slice(7);
        } else if (cleaned.startsWith('```')) {
            cleaned = cleaned.slice(3);
        }
        if (cleaned.endsWith('```')) {
            cleaned = cleaned.slice(0, -3);
        }
        cleaned = cleaned.trim();

        const parsed = JSON.parse(cleaned);

        if (!Array.isArray(parsed)) {
            throw new Error('AI response is not an array');
        }

        return parsed.map((item: any) => ({
            name: String(item.name || 'Unnamed dish'),
            story: String(item.story || ''),
            icon: String(item.icon || '🍽️'),
        }));
    },
};
