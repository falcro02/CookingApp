import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { mealService } from '../services/mealService';
import { buildResponse } from '../utils/response';

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        // --- 1. AUTHENTICATION & LOCAL BYPASS ---
        let userId: string;
        const cognitoUserId = event.requestContext?.authorizer?.claims?.sub;

        if (process.env.AWS_SAM_LOCAL) {
            console.log("LOCAL MODE: Bypassing Auth.");
            userId = 'USER#LOCAL_TEST_ID';
        } else {
            if (!cognitoUserId) {
                console.warn("PRODUCTION MODE: Unauthorized access blocked.");
                return buildResponse(401, { error: 'Unauthorized: Missing valid token' });
            }
            userId = `USER#${cognitoUserId}`;
        }

        // --- 2. ROUTING PREPARATION ---
        const httpMethod = event.httpMethod;
        const itemID = event.pathParameters?.itemID;

        // Automatically handle browser preflight requests for React
        if (httpMethod === 'OPTIONS') {
            return buildResponse(200, '');
        }

        // --- POST /meals ---
        if (httpMethod === 'POST') {
            try {
                const body = JSON.parse(event.body || '{}');
                const newItemID = await mealService.createMeal(userId, body);
                return buildResponse(201, { itemID: newItemID });
            } catch (error: any) {
                console.error("POST /meals Error:", error);

                // Smart Error Catching: If it's not a validation error, expose the real DB crash
                if (error.message?.includes('invalid field') || error.name === 'ValidationError') {
                    return buildResponse(400, { error: 'invalid field' });
                }
                return buildResponse(500, { error: 'Database/Server Crash', details: error.message });
            }
        }

        // --- DELETE /meals/{itemID} ---
        if (httpMethod === 'DELETE' && itemID) {
            try {
                await mealService.deleteMeal(userId, itemID);
                return buildResponse(204, '');
            } catch (error: any) {
                console.error(`DELETE /meals/${itemID} Error:`, error);
                if (error.message === 'meal not found') return buildResponse(404, { error: 'meal not found' });
                return buildResponse(500, { error: 'Database/Server Crash', details: error.message });
            }
        }

        // --- PATCH /meals/{itemID} ---
        if (httpMethod === 'PATCH' && itemID) {
            try {
                const body = JSON.parse(event.body || '{}');
                await mealService.updateMeal(userId, itemID, body);
                return buildResponse(204, '');
            } catch (error: any) {
                console.error(`PATCH /meals/${itemID} Error:`, error);
                if (error.message === 'meal not found') return buildResponse(404, { error: 'meal not found' });
                if (error.message?.includes('invalid field')) return buildResponse(400, { error: 'invalid field' });
                return buildResponse(500, { error: 'Database/Server Crash', details: error.message });
            }
        }

        // Fallback for incorrect URLs
        return buildResponse(404, { message: 'Route not found' });

    } catch (globalError: any) {
        console.error("FATAL HANDLER ERROR:", globalError);
        return buildResponse(500, { message: 'Fatal server error', error: globalError.message });
    }
};