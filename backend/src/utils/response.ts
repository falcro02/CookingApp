import { APIGatewayProxyResult } from 'aws-lambda';

/**
 * Standardizes API Gateway responses and centralizes CORS configuration.
 * Using a utility like this ensures consistency across all Lambdas.
 */
export const buildResponse = (statusCode: number, body: any): APIGatewayProxyResult => {
    return {
        statusCode,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*", // For development. Restrict this in production.
            "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        },
        body: JSON.stringify(body),
    };
};