import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { mealService } from '../services/mealService';
import { buildResponse } from '../utils/response';
import { CreateMealInput, UpdateMealInput } from '@shared/types/plans';

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        // --- 1. AUTHENTICATION & LOCAL BYPASS ---
        let userId: string;
        const cognitoUserId = event.requestContext?.authorizer?.claims?.sub;

        if (process.env.AWS_SAM_LOCAL) {
            console.log('LOCAL MODE: Bypassing Auth.');
            userId = 'USER#LOCAL_TEST_ID';
        } else {
            if (!cognitoUserId) {
                console.warn('PRODUCTION MODE: Unauthorized access blocked.');
                return buildResponse(401, { error: 'Unauthorized: Missing valid token' });
            }
            userId = `USER#${cognitoUserId}`;
        }

        // --- 2. ROUTING PREPARATION ---
        const httpMethod = event.httpMethod;
        const itemId = event.pathParameters?.itemId;

        // Automatically handle browser preflight requests for React
        if (httpMethod === 'OPTIONS') {
            return buildResponse(200, '');
        }

        // --- GET /meals ---
        if (httpMethod === 'GET') {
            const meals = await mealService.getMeals(userId);
            return buildResponse(200, meals);
        }

        // --- POST /meals ---
        if (httpMethod === 'POST') {
            try {
                const body = JSON.parse(event.body || '{}') as CreateMealInput;
                const itemId = await mealService.createMeal(userId, body);
                return buildResponse(201, { itemId });
            } catch (error: any) {
                console.error('POST /meals Error:', error);

                // Smart Error Catching: If it's not a validation error, expose the real DB crash
                if (error.message?.includes('invalid field') || error.name === 'ValidationError') {
                    return buildResponse(400, { error: 'invalid field' });
                }
                return buildResponse(500, { error: 'Internal server error' });
            }
        }

        // --- DELETE /meals/{itemId} ---
        if (httpMethod === 'DELETE' && itemId) {
            try {
                await mealService.deleteMeal(userId, itemId);
                return buildResponse(204, '');
            } catch (error: any) {
                console.error(`DELETE /meals/${itemId} Error:`, error);
                if (error.message === 'meal not found') return buildResponse(404, { error: 'meal not found' });
                return buildResponse(500, { error: 'Internal server error' });
            }
        }

        // --- PATCH /meals/{itemId} ---
        if (httpMethod === 'PATCH' && itemId) {
            try {
                const body = JSON.parse(event.body || '{}') as UpdateMealInput;
                await mealService.updateMeal(userId, itemId, body);
                return buildResponse(204, '');
            } catch (error: any) {
                console.error(`PATCH /meals/${itemId} Error:`, error);
                if (error.message === 'meal not found') return buildResponse(404, { error: 'meal not found' });
                if (error.message?.includes('invalid field')) return buildResponse(400, { error: 'invalid field' });
                return buildResponse(500, { error: 'Internal server error' });
            }
        }

        // Fallback for incorrect URLs
        return buildResponse(404, { message: 'Route not found' });
    } catch (globalError: any) {
        console.error('FATAL HANDLER ERROR:', globalError);
        return buildResponse(500, { message: 'Internal server error' });
    }
};
