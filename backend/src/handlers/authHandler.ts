import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

// Intestazioni CORS standard per API Gateway
const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "OPTIONS,POST"
};

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        if (!event.body) {
            return { statusCode: 400, headers, body: "invalid ID token" };
        }

        const body = JSON.parse(event.body);
        const { idToken } = body;

        // Validazione: se l'idToken manca, restituiamo 400 come da specifiche
        if (!idToken) {
            return { statusCode: 400, headers, body: "invalid ID token" };
        }

        const path = event.path || event.resource;

        // Smistamento logica in base al path (/signin/google o /signin/apple)
        if (path.includes('/signin/google')) {
            return await handleGoogleSignIn(idToken);
        } else if (path.includes('/signin/apple')) {
            return await handleAppleSignIn(idToken);
        }

        return { statusCode: 404, headers, body: "Not Found" };

    } catch (error: any) {
        console.error("Auth Error:", error);
        return { statusCode: 500, headers, body: "Internal Server Error" };
    }
};

async function handleGoogleSignIn(idToken: string): Promise<APIGatewayProxyResult> {
    // TODO: Inserire qui la logica reale (es. con google-auth-library) per verificare l'idToken
    console.log("Verificando idToken Google:", idToken);
    
    // Creazione di un jwtToken fittizio per il test
    const mockJwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.google_mock_session";

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            jwtToken: mockJwtToken
        }),
    };
}

async function handleAppleSignIn(idToken: string): Promise<APIGatewayProxyResult> {
    // TODO: Inserire qui la logica reale (es. con verify-apple-id-token) per verificare l'idToken
    console.log("Verificando idToken Apple:", idToken);
    
    // Creazione di un jwtToken fittizio per il test
    const mockJwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.apple_mock_session";

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            jwtToken: mockJwtToken
        }),
    };
}