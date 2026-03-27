import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ideaService } from '../services/ideaService';
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

        if (httpMethod === 'OPTIONS') {
            return buildResponse(200, '');
        }

        // --- GET /ideas ---
        if (httpMethod === 'GET' && resource === '/ideas') {
            const ideas = await ideaService.getIdeas(userId);
            return buildResponse(200, { ideas });
        }

        // --- POST /ideas/generate ---
        if (httpMethod === 'POST' && resource === '/ideas/generate') {
            try {
                const taskId = await ideaService.generateIdea(userId);
                return buildResponse(202, { taskId });
            } catch (error: any) {
                const statusCode = (error as any).statusCode;
                if (statusCode === 409) return buildResponse(409, { error: error.message });
                if (statusCode === 429) return buildResponse(429, { error: error.message });
                return buildResponse(500, { error: 'Internal server error' });
            }
        }

        // --- DELETE /ideas ---
        if (httpMethod === 'DELETE' && resource === '/ideas') {
            await ideaService.deleteIdeas(userId);
            return buildResponse(204, '');
        }

        return buildResponse(404, { message: 'Route not found' });
    } catch (globalError: any) {
        console.error('FATAL HANDLER ERROR:', globalError);
        return buildResponse(500, { message: 'Internal server error' });
    }
};
