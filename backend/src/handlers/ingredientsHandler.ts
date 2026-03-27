import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ingredientsService } from '../services/ingredientsService';
import { buildResponse } from '../utils/response';
import { IngredientItem } from '@shared/types/ingredients';

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const method = event.httpMethod;
    const path = event.path;
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

        // GET /ingredients
        if (method === 'GET' && path === '/ingredients') {
            const data = await ingredientsService.getIngredients(userId);
            return buildResponse(200, data);
        }

        // DELETE /ingredients (Clear all)
        if (method === 'DELETE' && path === '/ingredients') {
            await ingredientsService.clearIngredients(userId);
            return buildResponse(204, null);
        }

        // POST /ingredients (Add new)
        if (method === 'POST' && path === '/ingredients') {
            const body = JSON.parse(event.body || '{}') as IngredientItem;
            if (!body.description) return buildResponse(400, { message: 'Missing description' });
            const res = await ingredientsService.addIngredient(userId, body);
            return buildResponse(201, res);
        }

        // POST /ingredients/import
        if (method === 'POST' && path === '/ingredients/import') {
            await ingredientsService.importFromGroceries(userId);
            return buildResponse(204, null);
        }

        // DELETE /ingredients/{itemId}
        if (method === 'DELETE' && event.pathParameters?.itemId) {
            const itemId = event.pathParameters.itemId;
            await ingredientsService.deleteIngredient(userId, itemId);
            return buildResponse(204, null);
        }

        // PATCH /ingredients/{itemId}
        if (method === 'PATCH' && event.pathParameters?.itemId) {
            const itemId = event.pathParameters.itemId;
            const body = JSON.parse(event.body || '{}') as Partial<IngredientItem>;
            await ingredientsService.updateIngredient(userId, itemId, body);
            return buildResponse(204, null);
        }

        return buildResponse(405, { message: 'Method Not Allowed' });
    } catch (error: any) {
        console.error(error);
        return buildResponse(500, { message: 'Internal server error' });
    }
};
