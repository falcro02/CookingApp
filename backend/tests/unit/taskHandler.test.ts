import { APIGatewayProxyEvent } from 'aws-lambda';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockGetTaskStatus = jest.fn<(...args: any[]) => any>();

jest.mock('../../src/services/taskService', () => ({
    taskService: {
        getTaskStatus: (...args: any[]) => mockGetTaskStatus(...args),
    }
}));

import { lambdaHandler } from '../../src/handlers/taskHandler';

function makeEvent(overrides: Partial<APIGatewayProxyEvent> = {}): APIGatewayProxyEvent {
    return {
        httpMethod: 'GET',
        body: null,
        headers: {},
        isBase64Encoded: false,
        multiValueHeaders: {},
        multiValueQueryStringParameters: {},
        path: '/tasks/task-123',
        pathParameters: { taskID: 'task-123' },
        queryStringParameters: null,
        requestContext: {
            accountId: '123456789012',
            apiId: '1234',
            authorizer: { claims: { sub: 'test-cognito-id' } },
            httpMethod: 'GET',
            identity: {
                accessKey: '', accountId: '', apiKey: '', apiKeyId: '', caller: '',
                clientCert: { clientCertPem: '', issuerDN: '', serialNumber: '', subjectDN: '', validity: { notAfter: '', notBefore: '' } },
                cognitoAuthenticationProvider: '', cognitoAuthenticationType: '', cognitoIdentityId: '',
                cognitoIdentityPoolId: '', principalOrgId: '', sourceIp: '', user: '', userAgent: '', userArn: '',
            },
            path: '/tasks/task-123',
            protocol: 'HTTP/1.1',
            requestId: 'test-request-id',
            requestTimeEpoch: 1428582896000,
            resourceId: '123456',
            resourcePath: '/tasks/{taskID}',
            stage: 'Prod',
        },
        resource: '/tasks/{taskID}',
        stageVariables: {},
        ...overrides,
    };
}

describe('taskHandler', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        delete process.env.AWS_SAM_LOCAL;
    });

    // --- AUTH ---

    describe('authentication', () => {
        it('returns 401 when no cognito token in production', async () => {
            const event = makeEvent({
                requestContext: {
                    ...makeEvent().requestContext,
                    authorizer: {},
                },
            });
            const result = await lambdaHandler(event);
            expect(result.statusCode).toBe(401);
            expect(JSON.parse(result.body)).toEqual({ error: 'Unauthorized: Missing valid token' });
        });

        it('uses USER#LOCAL_TEST_ID in local mode', async () => {
            process.env.AWS_SAM_LOCAL = 'true';
            mockGetTaskStatus.mockResolvedValue(0);
            const event = makeEvent({
                requestContext: {
                    ...makeEvent().requestContext,
                    authorizer: {},
                },
            });
            const result = await lambdaHandler(event);
            expect(result.statusCode).toBe(200);
            expect(mockGetTaskStatus).toHaveBeenCalledWith('USER#LOCAL_TEST_ID', 'task-123');
        });
    });

    // --- OPTIONS ---

    it('returns 200 for OPTIONS', async () => {
        const event = makeEvent({ httpMethod: 'OPTIONS' });
        const result = await lambdaHandler(event);
        expect(result.statusCode).toBe(200);
    });

    // --- GET /tasks/{taskID} ---

    describe('GET /tasks/{taskID}', () => {
        it('returns task status 0 (running)', async () => {
            mockGetTaskStatus.mockResolvedValue(0);
            const event = makeEvent();
            const result = await lambdaHandler(event);
            expect(result.statusCode).toBe(200);
            expect(JSON.parse(result.body)).toEqual({ status: 0 });
        });

        it('returns task status 1 (completed)', async () => {
            mockGetTaskStatus.mockResolvedValue(1);
            const event = makeEvent();
            const result = await lambdaHandler(event);
            expect(result.statusCode).toBe(200);
            expect(JSON.parse(result.body)).toEqual({ status: 1 });
        });

        it('returns task status -1 (failed)', async () => {
            mockGetTaskStatus.mockResolvedValue(-1);
            const event = makeEvent();
            const result = await lambdaHandler(event);
            expect(result.statusCode).toBe(200);
            expect(JSON.parse(result.body)).toEqual({ status: -1 });
        });

        it('returns 404 when task not found', async () => {
            mockGetTaskStatus.mockResolvedValue(null);
            const event = makeEvent();
            const result = await lambdaHandler(event);
            expect(result.statusCode).toBe(404);
            expect(JSON.parse(result.body)).toEqual({ error: 'task not found' });
        });
    });

    // --- Unknown route ---

    it('returns 404 for unknown route', async () => {
        const event = makeEvent({
            httpMethod: 'POST',
            pathParameters: null,
        });
        const result = await lambdaHandler(event);
        expect(result.statusCode).toBe(404);
        expect(JSON.parse(result.body)).toEqual({ message: 'Route not found' });
    });

    // --- Fatal error ---

    it('returns 500 on fatal error', async () => {
        mockGetTaskStatus.mockRejectedValue(new Error('DB connection failed'));
        const event = makeEvent();
        const result = await lambdaHandler(event);
        expect(result.statusCode).toBe(500);
        expect(JSON.parse(result.body).message).toBe('Fatal server error');
    });
});
