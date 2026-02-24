import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { MealService } from '../services/mealService';
import { buildResponse } from '../utils/response';
import { CreateMealInput } from '../models/meal';

const mealService = new MealService();

/**
 * Lambda entry point. Handles routing based on HTTP methods.
 */
export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const method = event.httpMethod;
    let userId: string;

    // --- AUTHENTICATION & LOCAL BYPASS LOGIC ---

    // 1. Check if we are testing locally via SAM CLI
    if (process.env.AWS_SAM_LOCAL) {
        userId = "USER#LOCAL_MOCK_123";
    }
    // 2. Extract the real Cognito User ID (sub) when deployed in AWS
    else if (event.requestContext?.authorizer?.claims?.sub) {
        // We prepend "USER#" to keep a consistent Partition Key structure in DynamoDB
        userId = `USER#${event.requestContext.authorizer.claims.sub}`;
    }
    // 3. Reject requests that lack valid Cognito claims (allow OPTIONS for CORS)
    else if (method !== 'OPTIONS') {
        return buildResponse(401, { message: "Unauthorized: Missing user claims" });
    } else {
        userId = "UNKNOWN"; // Fallback purely to allow the OPTIONS preflight to execute
    }

    try {
        // Handle CORS Preflight
        if (method === 'OPTIONS') {
            return buildResponse(200, { message: "CORS OK" });
        }

        // --- READ ---
        if (method === 'GET') {
            const meals = await mealService.getUserMeals(userId);
            return buildResponse(200, meals);
        }

        // --- CREATE ---
        if (method === 'POST') {
            const body = JSON.parse(event.body || '{}') as CreateMealInput;

            if (!body.name || !body.date) {
                return buildResponse(400, { message: "Missing required fields: name or date" });
            }

            const newMeal = await mealService.createMeal(userId, body);
            return buildResponse(201, newMeal);
        }

        // --- DELETE ---
        if (method === 'DELETE') {
            const date = event.queryStringParameters?.date;
            if (!date) {
                return buildResponse(400, { message: "Missing date parameter" });
            }

            await mealService.deleteUserMeal(userId, date);
            return buildResponse(200, { message: "Meal deleted" });
        }

        return buildResponse(405, { message: "Method Not Allowed" });

    } catch (error: any) {
        console.error("Handler Error:", error);
        return buildResponse(500, { message: "Internal Server Error", error: error.message });
    }
};