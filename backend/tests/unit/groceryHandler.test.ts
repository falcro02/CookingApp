import { APIGatewayProxyEvent } from 'aws-lambda';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock groceryService before importing handler
const mockGetGroceries = jest.fn<(...args: any[]) => any>();
const mockCreateGrocery = jest.fn<(...args: any[]) => any>();
const mockClearGroceries = jest.fn<(...args: any[]) => any>();
const mockDeleteGrocery = jest.fn<(...args: any[]) => any>();
const mockUpdateGrocery = jest.fn<(...args: any[]) => any>();
const mockCheckAll = jest.fn<(...args: any[]) => any>();
const mockGenerateGroceries = jest.fn<(...args: any[]) => any>();

jest.mock('../../src/services/groceryService', () => ({
    groceryService: {
        getGroceries: (...args: any[]) => mockGetGroceries(...args),
        createGrocery: (...args: any[]) => mockCreateGrocery(...args),
        clearGroceries: (...args: any[]) => mockClearGroceries(...args),
        deleteGrocery: (...args: any[]) => mockDeleteGrocery(...args),
        updateGrocery: (...args: any[]) => mockUpdateGrocery(...args),
        checkAll: (...args: any[]) => mockCheckAll(...args),
        generateGroceries: (...args: any[]) => mockGenerateGroceries(...args),
    }
}));

import { lambdaHandler } from '../../src/handlers/groceryHandler';

function makeEvent(overrides: Partial<APIGatewayProxyEvent> = {}): APIGatewayProxyEvent {
    return {
        httpMethod: 'GET',
        body: null,
        headers: {},
        isBase64Encoded: false,
        multiValueHeaders: {},
        multiValueQueryStringParameters: {},
        path: '/groceries',
        pathParameters: null,
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
            path: '/groceries',
            protocol: 'HTTP/1.1',
            requestId: 'test-request-id',
            requestTimeEpoch: 1428582896000,
            resourceId: '123456',
            resourcePath: '/groceries',
            stage: 'Prod',
        },
        resource: '/groceries',
        stageVariables: {},
        ...overrides,
    };
}

describe('groceryHandler', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        delete process.env.AWS_SAM_LOCAL;
    });

    // --- AUTH ---

    describe('authentication', () => {
        it('returns 401 when no cognito token in production mode', async () => {
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
            mockGetGroceries.mockResolvedValue({});
            const event = makeEvent({
                requestContext: {
                    ...makeEvent().requestContext,
                    authorizer: {},
                },
            });
            const result = await lambdaHandler(event);
            expect(result.statusCode).toBe(200);
            expect(mockGetGroceries).toHaveBeenCalledWith('USER#LOCAL_TEST_ID');
        });

        it('uses USER#<cognitoId> in production mode', async () => {
            mockGetGroceries.mockResolvedValue({});
            const event = makeEvent();
            const result = await lambdaHandler(event);
            expect(result.statusCode).toBe(200);
            expect(mockGetGroceries).toHaveBeenCalledWith('USER#test-cognito-id');
        });
    });

    // --- OPTIONS ---

    it('returns 200 for OPTIONS', async () => {
        const event = makeEvent({ httpMethod: 'OPTIONS' });
        const result = await lambdaHandler(event);
        expect(result.statusCode).toBe(200);
    });

    // --- GET /groceries ---

    describe('GET /groceries', () => {
        it('returns groceries successfully', async () => {
            const groceries = {
                '123': { description: 'Chicken - 1kg', weekDay: 0, checked: false },
                '456': { description: 'Onions - 3', weekDay: 1, checked: true },
            };
            mockGetGroceries.mockResolvedValue(groceries);
            const event = makeEvent();
            const result = await lambdaHandler(event);
            expect(result.statusCode).toBe(200);
            expect(JSON.parse(result.body)).toEqual({ groceries });
        });

        it('returns empty groceries', async () => {
            mockGetGroceries.mockResolvedValue({});
            const event = makeEvent();
            const result = await lambdaHandler(event);
            expect(result.statusCode).toBe(200);
            expect(JSON.parse(result.body)).toEqual({ groceries: {} });
        });
    });

    // --- POST /groceries ---

    describe('POST /groceries', () => {
        it('creates grocery and returns 201 with itemID', async () => {
            mockCreateGrocery.mockResolvedValue('item-123');
            const event = makeEvent({
                httpMethod: 'POST',
                resource: '/groceries',
                body: JSON.stringify({ description: 'Pasta - 500g', weekDay: 2 }),
            });
            const result = await lambdaHandler(event);
            expect(result.statusCode).toBe(201);
            expect(JSON.parse(result.body)).toEqual({ itemID: 'item-123' });
        });

        it('returns 400 on invalid field', async () => {
            mockCreateGrocery.mockRejectedValue(new Error('invalid field'));
            const event = makeEvent({
                httpMethod: 'POST',
                resource: '/groceries',
                body: JSON.stringify({}),
            });
            const result = await lambdaHandler(event);
            expect(result.statusCode).toBe(400);
        });
    });

    // --- DELETE /groceries ---

    describe('DELETE /groceries', () => {
        it('clears all groceries and returns 204', async () => {
            mockClearGroceries.mockResolvedValue(undefined);
            const event = makeEvent({
                httpMethod: 'DELETE',
                resource: '/groceries',
            });
            const result = await lambdaHandler(event);
            expect(result.statusCode).toBe(204);
        });
    });

    // --- DELETE /groceries/{itemID} ---

    describe('DELETE /groceries/{itemID}', () => {
        it('deletes a grocery item and returns 204', async () => {
            mockDeleteGrocery.mockResolvedValue(undefined);
            const event = makeEvent({
                httpMethod: 'DELETE',
                resource: '/groceries/{itemID}',
                pathParameters: { itemID: 'item-123' },
            });
            const result = await lambdaHandler(event);
            expect(result.statusCode).toBe(204);
            expect(mockDeleteGrocery).toHaveBeenCalledWith('USER#test-cognito-id', 'item-123');
        });

        it('returns 404 when item not found', async () => {
            mockDeleteGrocery.mockRejectedValue(new Error('item not found'));
            const event = makeEvent({
                httpMethod: 'DELETE',
                resource: '/groceries/{itemID}',
                pathParameters: { itemID: 'nonexistent' },
            });
            const result = await lambdaHandler(event);
            expect(result.statusCode).toBe(404);
            expect(JSON.parse(result.body)).toEqual({ error: 'item not found' });
        });
    });

    // --- PATCH /groceries/{itemID} ---

    describe('PATCH /groceries/{itemID}', () => {
        it('updates grocery description and returns 204', async () => {
            mockUpdateGrocery.mockResolvedValue(undefined);
            const event = makeEvent({
                httpMethod: 'PATCH',
                resource: '/groceries/{itemID}',
                pathParameters: { itemID: 'item-123' },
                body: JSON.stringify({ description: 'Updated item' }),
            });
            const result = await lambdaHandler(event);
            expect(result.statusCode).toBe(204);
            expect(mockUpdateGrocery).toHaveBeenCalledWith('USER#test-cognito-id', 'item-123', { description: 'Updated item' });
        });

        it('updates grocery checked status and returns 204', async () => {
            mockUpdateGrocery.mockResolvedValue(undefined);
            const event = makeEvent({
                httpMethod: 'PATCH',
                resource: '/groceries/{itemID}',
                pathParameters: { itemID: 'item-123' },
                body: JSON.stringify({ checked: true }),
            });
            const result = await lambdaHandler(event);
            expect(result.statusCode).toBe(204);
        });

        it('returns 404 when item not found', async () => {
            mockUpdateGrocery.mockRejectedValue(new Error('item not found'));
            const event = makeEvent({
                httpMethod: 'PATCH',
                resource: '/groceries/{itemID}',
                pathParameters: { itemID: 'nonexistent' },
                body: JSON.stringify({ checked: true }),
            });
            const result = await lambdaHandler(event);
            expect(result.statusCode).toBe(404);
        });

        it('returns 400 on invalid field', async () => {
            mockUpdateGrocery.mockRejectedValue(new Error('invalid field'));
            const event = makeEvent({
                httpMethod: 'PATCH',
                resource: '/groceries/{itemID}',
                pathParameters: { itemID: 'item-123' },
                body: JSON.stringify({ checked: 'not-a-bool' }),
            });
            const result = await lambdaHandler(event);
            expect(result.statusCode).toBe(400);
        });
    });

    // --- POST /groceries/check ---

    describe('POST /groceries/check', () => {
        it('checks all groceries and returns 204', async () => {
            mockCheckAll.mockResolvedValue(undefined);
            const event = makeEvent({
                httpMethod: 'POST',
                resource: '/groceries/check',
                body: JSON.stringify({ check: true }),
            });
            const result = await lambdaHandler(event);
            expect(result.statusCode).toBe(204);
            expect(mockCheckAll).toHaveBeenCalledWith('USER#test-cognito-id', true);
        });

        it('unchecks all groceries and returns 204', async () => {
            mockCheckAll.mockResolvedValue(undefined);
            const event = makeEvent({
                httpMethod: 'POST',
                resource: '/groceries/check',
                body: JSON.stringify({ check: false }),
            });
            const result = await lambdaHandler(event);
            expect(result.statusCode).toBe(204);
            expect(mockCheckAll).toHaveBeenCalledWith('USER#test-cognito-id', false);
        });

        it('returns 400 on invalid field', async () => {
            mockCheckAll.mockRejectedValue(new Error('invalid field'));
            const event = makeEvent({
                httpMethod: 'POST',
                resource: '/groceries/check',
                body: JSON.stringify({ check: 'yes' }),
            });
            const result = await lambdaHandler(event);
            expect(result.statusCode).toBe(400);
        });
    });

    // --- POST /groceries/generate ---

    describe('POST /groceries/generate', () => {
        const validBody = {
            days: [0, 1, 2],
            plan: 1,
            unplanned: [],
            extra: '',
            replace: true,
        };

        it('returns 202 with taskID on success', async () => {
            mockGenerateGroceries.mockResolvedValue('task-789');
            const event = makeEvent({
                httpMethod: 'POST',
                resource: '/groceries/generate',
                body: JSON.stringify(validBody),
            });
            const result = await lambdaHandler(event);
            expect(result.statusCode).toBe(202);
            expect(JSON.parse(result.body)).toEqual({ taskID: 'task-789' });
        });

        it('returns 404 when no meals found', async () => {
            const error = new Error('No meals found for the specified plan');
            (error as any).statusCode = 404;
            mockGenerateGroceries.mockRejectedValue(error);
            const event = makeEvent({
                httpMethod: 'POST',
                resource: '/groceries/generate',
                body: JSON.stringify(validBody),
            });
            const result = await lambdaHandler(event);
            expect(result.statusCode).toBe(404);
        });

        it('returns 409 when task already running', async () => {
            const error = new Error('A generation task is already running');
            (error as any).statusCode = 409;
            mockGenerateGroceries.mockRejectedValue(error);
            const event = makeEvent({
                httpMethod: 'POST',
                resource: '/groceries/generate',
                body: JSON.stringify(validBody),
            });
            const result = await lambdaHandler(event);
            expect(result.statusCode).toBe(409);
        });

        it('returns 429 when daily limit reached', async () => {
            const error = new Error('Daily generation limit reached');
            (error as any).statusCode = 429;
            mockGenerateGroceries.mockRejectedValue(error);
            const event = makeEvent({
                httpMethod: 'POST',
                resource: '/groceries/generate',
                body: JSON.stringify(validBody),
            });
            const result = await lambdaHandler(event);
            expect(result.statusCode).toBe(429);
        });

        it('returns 400 on validation error', async () => {
            mockGenerateGroceries.mockRejectedValue(new Error('days must be a non-empty array'));
            const event = makeEvent({
                httpMethod: 'POST',
                resource: '/groceries/generate',
                body: JSON.stringify({ days: [], plan: 1, unplanned: [], extra: '', replace: true }),
            });
            const result = await lambdaHandler(event);
            expect(result.statusCode).toBe(400);
        });
    });

    // --- Unknown route ---

    it('returns 404 for unknown route', async () => {
        const event = makeEvent({
            httpMethod: 'PUT',
            resource: '/groceries/unknown',
        });
        const result = await lambdaHandler(event);
        expect(result.statusCode).toBe(404);
        expect(JSON.parse(result.body)).toEqual({ message: 'Route not found' });
    });
});
