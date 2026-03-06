import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { groceryService } from '../services/groceryService';
import { buildResponse } from '../utils/response';
import {
    GenerateGroceriesRequest,
    CreateGroceryRequest,
    UpdateGroceryRequest,
    CheckAllRequest,
} from '../models/grocery';

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

        // --- 2. ROUTING ---
        const httpMethod = event.httpMethod;
        const resource = event.resource;
        const itemID = event.pathParameters?.itemID;

        if (httpMethod === 'OPTIONS') {
            return buildResponse(200, '');
        }

        // --- GET /groceries ---
        if (httpMethod === 'GET' && resource === '/groceries') {
            const groceries = await groceryService.getGroceries(userId);
            return buildResponse(200, { groceries });
        }

        // --- POST /groceries/generate ---
        if (httpMethod === 'POST' && resource === '/groceries/generate') {
            try {
                const body = JSON.parse(event.body || '{}') as GenerateGroceriesRequest;
                const taskID = await groceryService.generateGroceries(userId, body);
                return buildResponse(202, { taskID });
            } catch (error: any) {
                const statusCode = (error as any).statusCode;
                if (statusCode === 404) return buildResponse(404, { error: error.message });
                if (statusCode === 409) return buildResponse(409, { error: error.message });
                if (statusCode === 429) return buildResponse(429, { error: error.message });
                if (error.message?.includes('must be')) return buildResponse(400, { error: error.message });
                return buildResponse(500, { error: 'Internal server error' });
            }
        }

        // --- POST /groceries/check ---
        if (httpMethod === 'POST' && resource === '/groceries/check') {
            try {
                const body = JSON.parse(event.body || '{}') as CheckAllRequest;
                await groceryService.checkAll(userId, body.check);
                return buildResponse(204, '');
            } catch (error: any) {
                if (error.message === 'invalid field') return buildResponse(400, { error: 'invalid field' });
                return buildResponse(500, { error: 'Internal server error' });
            }
        }

        // --- POST /groceries ---
        if (httpMethod === 'POST' && resource === '/groceries') {
            try {
                const body = JSON.parse(event.body || '{}') as CreateGroceryRequest;
                const itemID = await groceryService.createGrocery(userId, body);
                return buildResponse(201, { itemID });
            } catch (error: any) {
                if (error.message === 'invalid field') return buildResponse(400, { error: 'invalid field' });
                return buildResponse(500, { error: 'Internal server error' });
            }
        }

        // --- DELETE /groceries ---
        if (httpMethod === 'DELETE' && resource === '/groceries') {
            await groceryService.clearGroceries(userId);
            return buildResponse(204, '');
        }

        // --- DELETE /groceries/{itemID} ---
        if (httpMethod === 'DELETE' && resource === '/groceries/{itemID}' && itemID) {
            try {
                await groceryService.deleteGrocery(userId, itemID);
                return buildResponse(204, '');
            } catch (error: any) {
                if (error.message === 'item not found') return buildResponse(404, { error: 'item not found' });
                return buildResponse(500, { error: 'Internal server error' });
            }
        }

        // --- PATCH /groceries/{itemID} ---
        if (httpMethod === 'PATCH' && resource === '/groceries/{itemID}' && itemID) {
            try {
                const body = JSON.parse(event.body || '{}') as UpdateGroceryRequest;
                await groceryService.updateGrocery(userId, itemID, body);
                return buildResponse(204, '');
            } catch (error: any) {
                if (error.message === 'invalid field') return buildResponse(400, { error: 'invalid field' });
                if (error.message === 'item not found') return buildResponse(404, { error: 'item not found' });
                return buildResponse(500, { error: 'Internal server error' });
            }
        }

        return buildResponse(404, { message: 'Route not found' });
    } catch (globalError: any) {
        console.error('FATAL HANDLER ERROR:', globalError);
        return buildResponse(500, { message: 'Internal server error' });
    }
};
