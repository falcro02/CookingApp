import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PantryService } from '../services/pantryService';
import { buildResponse } from '../utils/response';
import { CreatePantryItemInput } from '../models/pantry';

const pantryService = new PantryService();

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const method = event.httpMethod;
    let userId = "UNKNOWN";

    if (process.env.AWS_SAM_LOCAL) {
        userId = "USER#LOCAL_MOCK_123";
    } else if (event.requestContext?.authorizer?.claims?.sub) {
        userId = `USER#${event.requestContext.authorizer.claims.sub}`;
    } else if (method !== 'OPTIONS') {
        return buildResponse(401, { message: "Unauthorized" });
    }

    try {
        if (method === 'OPTIONS') return buildResponse(200, { message: "CORS OK" });

        if (method === 'GET') {
            const items = await pantryService.getPantryItems(userId);
            return buildResponse(200, items);
        }

        if (method === 'POST') {
            const body = JSON.parse(event.body || '{}') as CreatePantryItemInput;
            const newItem = await pantryService.addPantryItem(userId, body);
            return buildResponse(201, newItem);
        }

        if (method === 'DELETE') {
            const itemId = event.queryStringParameters?.itemId;
            if (!itemId) return buildResponse(400, { message: "Missing itemId" });
            await pantryService.deletePantryItem(userId, itemId);
            return buildResponse(200, { message: "Item deleted" });
        }

        return buildResponse(405, { message: "Method Not Allowed" });
    } catch (error: any) {
        console.error(error);
        return buildResponse(500, { message: "Internal Server Error", error: error.message });
    }
};
