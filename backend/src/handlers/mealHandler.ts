import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { MealService } from '../services/mealService';
import { buildResponse } from '../utils/response';
import { CreateMealInput } from '../models/meal';

const mealService = new MealService();

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const method = event.httpMethod;
    let userId: string;

    // Cognito Authentication & Local Bypass
    if (process.env.AWS_SAM_LOCAL) {
        userId = "USER#LOCAL_MOCK_123";
    } else if (event.requestContext?.authorizer?.claims?.sub) {
        userId = `USER#${event.requestContext.authorizer.claims.sub}`;
    } else if (method !== 'OPTIONS') {
        return buildResponse(401, { message: "Unauthorized: Missing user claims" });
    } else {
        userId = "UNKNOWN";
    }

    try {
        const path = event.path || '';

        if (method === 'OPTIONS') {
            return buildResponse(200, { message: "CORS OK" });
        }

        if (method === 'GET') {
            const meals = await mealService.getUserMeals(userId);
            return buildResponse(200, meals);
        }

        if (method === 'POST') {
            // NEW ROUTE: POST /weekly-plans
            if (path.includes('/weekly-plans')) {
                const body = JSON.parse(event.body || '[]') as CreateMealInput[];

                if (!Array.isArray(body)) {
                    return buildResponse(400, { message: "Body must be an array of meals" });
                }

                const savedPlan = await mealService.createWeeklyPlan(userId, body);
                return buildResponse(201, { message: "Weekly plan saved successfully", meals: savedPlan });
            }

            // EXISTING ROUTE: POST /meals
            else {
                const body = JSON.parse(event.body || '{}') as CreateMealInput;

                if (!body.name || !body.dayOfWeek || !body.type) {
                    return buildResponse(400, { message: "Missing required fields" });
                }

                const newMeal = await mealService.createMeal(userId, body);
                return buildResponse(201, newMeal);
            }
        }

        if (method === 'DELETE') {
            const sk = event.queryStringParameters?.sk;
            if (!sk) {
                return buildResponse(400, { message: "Missing sk parameter" });
            }

            await mealService.deleteUserMeal(userId, decodeURIComponent(sk));
            return buildResponse(200, { message: "Meal deleted" });
        }

        return buildResponse(405, { message: "Method Not Allowed" });

    } catch (error: any) {
        console.error("Handler Error:", error);
        return buildResponse(500, { message: "Internal Server Error", error: error.message });
    }

};