import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { taskService } from '../services/taskService';
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
        const taskID = event.pathParameters?.taskID;

        if (httpMethod === 'OPTIONS') {
            return buildResponse(200, '');
        }

        // --- GET /tasks/{taskID} ---
        if (httpMethod === 'GET' && taskID) {
            const status = await taskService.getTaskStatus(userId, taskID);
            if (status === null) {
                return buildResponse(404, { error: 'task not found' });
            }
            return buildResponse(200, { status });
        }

        return buildResponse(404, { message: 'Route not found' });

    } catch (globalError: any) {
        console.error("FATAL HANDLER ERROR:", globalError);
        return buildResponse(500, { message: 'Fatal server error', error: globalError.message });
    }
};
