import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { AiService } from '../services/aiService';
import { buildResponse } from '../utils/response';
import { AiRecipeRequest } from '../models/ai';

const aiService = new AiService();

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const method = event.httpMethod;
    // AI endpoints might not be user-specific in the same way, but it's good practice to secure them
    if (!process.env.AWS_SAM_LOCAL && !event.requestContext?.authorizer?.claims?.sub && method !== 'OPTIONS') {
        return buildResponse(401, { message: "Unauthorized" });
    }

    try {
        if (method === 'OPTIONS') return buildResponse(200, { message: "CORS OK" });

        if (method === 'POST') {
            const body = JSON.parse(event.body || '{}') as AiRecipeRequest;
            const recipe = await aiService.generateRecipe(body);
            return buildResponse(200, recipe);
        }

        return buildResponse(405, { message: "Method Not Allowed" });
    } catch (error: any) {
        console.error(error);
        return buildResponse(500, { message: "Internal Server Error", error: error.message });
    }
};
