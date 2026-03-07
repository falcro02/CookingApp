import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { mealRepository } from '../repositories/mealRepository';
import { groceryRepository } from '../repositories/groceryRepository';
import { taskRepository } from '../repositories/taskRepository';
import { preferenceRepository } from '../repositories/preferenceRepository';
import { GroceryWorkerPayload, GroceryItem, AiGroceryItem } from '../models/grocery';
import { Meal } from '../models/meal';
import { UserPreferences } from '../models/preferences';
import { counterRepository } from '../repositories/counterRepository';

const bedrockClient = new BedrockRuntimeClient({});

const MODEL_ID = 'eu.anthropic.claude-haiku-4-5-20251001-v1:0';

export const groceryWorkerService = {
    async execute(payload: GroceryWorkerPayload): Promise<void> {
        const { userId, taskID, days, plan, unplanned, extra, replace } = payload;

        try {
            // 1. Fetch all meals for the plan
            const allMealsInPlan: Meal[] = await mealRepository.findByPlan(userId, plan);

            // 2. Fetch user preferences
            const preferences: UserPreferences | null = await preferenceRepository.getPreferences(userId);

            // 3. Build the prompt
            const prompt = this.buildPrompt(allMealsInPlan, unplanned, days, preferences, extra);

            // 4. Call Bedrock
            const aiResponse = await this.callBedrock(prompt);

            // 5. Parse AI response
            const groceryItems: AiGroceryItem[] = this.parseAiResponse(aiResponse);

            // 6. If replace, delete existing grocery items
            if (replace) {
                await groceryRepository.deleteAllByUser(userId);
            }

            // 7. Write new grocery items
            const dbItems: GroceryItem[] = groceryItems.map((item, index) => ({
                PK: userId,
                SK: `GROCERY#${Date.now()}_${index}`,
                itemID: `${Date.now()}_${index}`,
                description: item.description,
                weekDay: item.weekDay,
                checked: false,
            }));

            await groceryRepository.batchCreate(dbItems);

            // 8. Increment daily generation counter
            const today = new Date().toISOString().split('T')[0];
            await counterRepository.incrementCount(userId, today);

            // 9. Mark task as completed
            await taskRepository.updateStatus(userId, taskID, 1);
        } catch (error: any) {
            console.error('GroceryWorker FAILED:', error);
            await taskRepository.updateStatus(userId, taskID, -1, error.message || 'Unknown error');
        }
    },

    buildPrompt(
        meals: Meal[],
        unplanned: string[],
        days: number[],
        preferences: UserPreferences | null,
        extra: string,
    ): string {
        const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const mealLines = meals.map((m) => `- ${dayNames[m.weekDay]} (day ${m.weekDay}): ${m.description}`).join('\n');

        const unplannedLines = unplanned.length > 0 ? unplanned.map((u) => `- ${u}`).join('\n') : 'None';

        const selectedDays = days.map((d) => `${dayNames[d]} (${d})`).join(', ');

        let preferencesBlock = 'No preferences set.';
        if (preferences) {
            const parts: string[] = [];
            if (preferences.dietaryRestrictions.length > 0) {
                parts.push(`Dietary restrictions: ${preferences.dietaryRestrictions.join(', ')}`);
            }
            if (preferences.allergies.length > 0) {
                parts.push(`Allergies (MUST AVOID): ${preferences.allergies.join(', ')}`);
            }
            if (preferences.dislikedIngredients.length > 0) {
                parts.push(`Disliked ingredients (avoid if possible): ${preferences.dislikedIngredients.join(', ')}`);
            }
            if (preferences.servingSize) {
                parts.push(`Serving size: ${preferences.servingSize} people`);
            }
            if (parts.length > 0) {
                preferencesBlock = parts.join('\n');
            }
        }

        const extraBlock = extra.trim() ? `Additional instructions from the user:\n${extra}` : '';

        return `You are a helpful meal-planning assistant. Generate a grocery shopping list for the following meals.

SHOPPING DAYS: ${selectedDays}
(These are the days the user plans to go grocery shopping)

PLANNED MEALS (all meals in the weekly plan):
${mealLines || 'None'}

ADDITIONAL UNPLANNED MEALS:
${unplannedLines}

USER PREFERENCES:
${preferencesBlock}

${extraBlock}

INSTRUCTIONS:
- Generate ingredients for ALL the planned meals listed above.
- For each ingredient, assign it to one of the SHOPPING DAYS (${selectedDays}).
- Assign each ingredient to the latest shopping day that is still BEFORE or ON the day the meal is planned.
- If no shopping day falls before the meal day, assign it to the earliest shopping day.
- If an ingredient is needed for multiple meals, combine it into one entry with the total quantity, assigned to the earliest relevant shopping day.
- Include the quantity in the description (e.g., "Chicken breast - 1kg", "Onions - 3 medium").
- Provide realistic quantities for the specified serving size.
- Respect all allergies strictly -- never include allergens.
- Respect dietary restrictions (e.g., no meat for vegetarian).
- Avoid disliked ingredients where possible.

Respond ONLY with a valid JSON array. Each element must have exactly these fields:
- "description": string (ingredient name with quantity, e.g. "Chicken breast - 1kg", "Onions - 3 medium")
- "weekDay": integer (MUST be one of the shopping days: ${days.join(', ')})

Example response format:
[
  {"description": "Chicken breast - 1kg", "weekDay": ${days[0]}},
  {"description": "Onions - 3 medium", "weekDay": ${days[0]}},
  {"description": "Pasta - 500g", "weekDay": ${days[days.length - 1] ?? days[0]}}
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

    parseAiResponse(responseText: string): AiGroceryItem[] {
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
            description: String(item.description || 'Unknown item'),
            weekDay: Number.isInteger(item.weekDay) && item.weekDay >= 0 && item.weekDay <= 6 ? item.weekDay : 0,
        }));
    },
};
