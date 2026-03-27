import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { preferencesService } from '../services/preferencesService';
import { buildResponse } from '../utils/response';
import { UpdatePreferencesInput } from '@shared/types/preferences';
import { Preferences } from '@shared/types/preferences';

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const method = event.httpMethod;
    let userId = 'UNKNOWN';

    if (process.env.AWS_SAM_LOCAL) {
        userId = 'USER#LOCAL_TEST_ID';
    } else if (event.requestContext?.authorizer?.claims?.sub) {
        userId = `USER#${event.requestContext.authorizer.claims.sub}`;
    } else if (method !== 'OPTIONS') {
        return buildResponse(401, { message: 'Unauthorized' });
    }

    try {
        if (method === 'OPTIONS') return buildResponse(200, { message: 'CORS OK' });

        if (method === 'GET') {
            const prefs = await preferencesService.getPreferences(userId);
            return buildResponse(200, prefs);
        }

        if (method === 'PATCH') {
            const body = JSON.parse(event.body || '{}') as UpdatePreferencesInput;

            // Validate minimum expected structure
            if (!body.preferences) {
                return buildResponse(400, { error: 'invalid field' });
            }

            await preferencesService.updatePreferences(userId, body);
            return buildResponse(204, '');
        }

        return buildResponse(405, { message: 'Method Not Allowed' });
    } catch (error: any) {
        console.error(error);
        return buildResponse(500, { message: 'Internal server error' });
    }
};
