/* Amplify Params - DO NOT EDIT
    ENV
    REGION
    STORAGE_MEALSDB_ARN
    STORAGE_MEALSDB_NAME
    STORAGE_MEALSDB_STREAMARN
Amplify Params - DO NOT EDIT */

const service = require('./mealService');
const validation = require('./validation');

const buildResponse = (statusCode, body) => {
    return {
        statusCode,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*"
        },
        body: JSON.stringify(body)
    };
};

exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);

    try {
        const method = event.httpMethod;
        const body = event.body ? JSON.parse(event.body) : {};
        const id = event.queryStringParameters ? event.queryStringParameters.id : null;

        // --- SECURITY CRITICAL ---
        // We get the User ID from the Cognito Token, NOT the request body.
        // This ensures User A can never fake being User B.
        // Note: For REST API with IAM Auth (Amplify default), use cognitoIdentityId
        const userId = event.requestContext.identity.cognitoIdentityId;

        if (!userId) {
            return buildResponse(401, { error: "Unauthorized: No User ID found" });
        }
        // -------------------------

        switch (method) {
            case 'GET':
                // Pass userId so we only get OUR meals
                const data = await service.getAllMeals(userId);
                return buildResponse(200, data);

            case 'POST':
                validation.validateCreateMeal(body);
                // Pass userId explicitly to the create function
                const createdItem = await service.createMeal(userId, body);
                return buildResponse(201, { success: true, message: "Meal created", item: createdItem });

            case 'PUT':
                validation.validateUpdateMeal(id, body);
                const updatedItem = await service.updateMeal(userId, id, body);
                return buildResponse(200, { success: true, message: "Meal updated", item: updatedItem });

            case 'DELETE':
                if (!id) throw new Error("Missing 'id' in query parameters for DELETE");
                await service.deleteMeal(userId, id);
                return buildResponse(200, { success: true, message: "Meal deleted" });

            default:
                return buildResponse(405, { error: `Method ${method} not allowed` });
        }

    } catch (error) {
        console.error("ERROR:", error);
        const statusCode = error.message.startsWith("Validation Failed") ? 400 : 500;

        if (error.code === 'ConditionalCheckFailedException') {
            return buildResponse(404, { error: "Item not found or access denied" });
        }

        return buildResponse(statusCode, { error: error.message });
    }
};