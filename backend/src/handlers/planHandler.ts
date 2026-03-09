import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { planService } from '../services/planService';
import { buildResponse } from '../utils/response';

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
        const planNR = event.pathParameters?.planNR;

        if (httpMethod === 'OPTIONS') {
            return buildResponse(200, '');
        }

        // --- GET /plans ---
        if (httpMethod === 'GET' && resource === '/plans') {
            const plansResponse = await planService.getPlans(userId);
            return buildResponse(200, plansResponse);
        }

        // --- PATCH /plans/current ---
        if (httpMethod === 'PATCH' && resource === '/plans/current') {
            try {
                const body = JSON.parse(event.body || '{}');
                if (body.current === undefined) {
                    return buildResponse(400, { error: 'invalid field' });
                }
                await planService.setCurrentPlan(userId, body.current);
                return buildResponse(204, '');
            } catch (error: any) {
                const statusCode = (error as any).statusCode;
                if (statusCode === 400) return buildResponse(400, { error: error.message });
                if (statusCode === 404) return buildResponse(404, { error: error.message });
                return buildResponse(500, { error: 'Internal server error' });
            }
        }

        // --- DELETE /plans/{planNR} ---
        if (httpMethod === 'DELETE' && resource === '/plans/{planNR}' && planNR) {
            try {
                await planService.deletePlan(userId, parseInt(planNR, 10));
                return buildResponse(204, '');
            } catch (error: any) {
                const statusCode = (error as any).statusCode;
                if (statusCode === 400) return buildResponse(400, { error: error.message });
                return buildResponse(500, { error: 'Internal server error' });
            }
        }

        return buildResponse(404, { message: 'Route not found' });
    } catch (globalError: any) {
        console.error('FATAL HANDLER ERROR:', globalError);
        return buildResponse(500, { message: 'Internal server error' });
    }
};
