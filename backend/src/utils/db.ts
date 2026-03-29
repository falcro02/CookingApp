import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

/**
 * Creates and configures a DynamoDB Client instance.
 * Automatically routes traffic to a local DynamoDB instance if AWS_SAM_LOCAL is detected.
 */
export const getDynamoClient = (): DynamoDBClient => {
    // When running under 'sam local start-api', SAM sets AWS_SAM_LOCAL=true
    if (process.env.AWS_SAM_LOCAL || process.env.USE_LOCAL_DYNAMODB) {
        // When running inside a SAM Docker container, '127.0.0.1' points to the container itself.
        // On Mac/Windows, 'host.docker.internal' points to the host machine where DynamoDB Local is running.
        const endpoint = process.env.AWS_SAM_LOCAL ? 'http://host.docker.internal:8000' : 'http://127.0.0.1:8000';

        console.log(`🔌 Connecting to local DynamoDB endpoint: ${endpoint}`);
        return new DynamoDBClient({
            endpoint: endpoint,
            region: process.env.AWS_REGION || 'eu-central-1',
        });
    }

    // Default configuration: targets the real AWS Cloud DynamoDB
    console.log('☁️ Connecting to REAL AWS DynamoDB Cloud');
    return new DynamoDBClient({});
};
