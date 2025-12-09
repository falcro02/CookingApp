const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const docClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.STORAGE_MEALSDB_NAME;

const ALLOWED_FIELDS = ['name', 'weekDay', 'mealType', 'ingredients'];

const buildItem = (baseItem, body) => {
    const item = { ...baseItem };
    ALLOWED_FIELDS.forEach(field => {
        if (body[field] !== undefined && body[field] !== null) {
            item[field] = body[field];
        }
    });
    return item;
};

// Optimized: Uses the 'byUser' index for fast lookup
const getAllMeals = async (userId) => {
    const params = {
        TableName: TABLE_NAME,
        IndexName: "byUser", // Must match the GSI name in cli-inputs.json
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
            ":userId": userId
        }
    };

    // Changing from .scan() to .query() is the key performance boost
    const data = await docClient.query(params).promise();
    return data.Items;
};

// Updated: Accept userId from handler
const createMeal = async (userId, body) => {
    const newId = uuidv4();

    const baseItem = {
        id: newId,
        userId: userId, // Securely assigned
        timestamp: new Date().toISOString()
    };

    const item = buildItem(baseItem, body);

    const params = {
        TableName: TABLE_NAME,
        Item: item,
        ConditionExpression: "attribute_not_exists(id)"
    };

    await docClient.put(params).promise();
    return item;
};

const updateMeal = async (userId, id, body) => {
    const baseItem = {
        id: id,
        userId: userId,
        timestamp: new Date().toISOString()
    };

    const item = buildItem(baseItem, body);

    const params = {
        TableName: TABLE_NAME,
        Item: item,
        // SECURITY: Only update if ID exists AND userId matches the requester
        ConditionExpression: "id = :id AND userId = :userId",
        ExpressionAttributeValues: {
            ":id": id,
            ":userId": userId
        }
    };

    // Note: put() overwrites. To support ConditionExpression correctly with put, 
    // we strictly rely on the ID check.
    // However, docClient.put doesn't support 'ExpressionAttributeValues' for Keys directly in standard put, 
    // but works in ConditionExpression.

    await docClient.put(params).promise();
    return item;
};

const deleteMeal = async (userId, id) => {
    const params = {
        TableName: TABLE_NAME,
        Key: { id: id },
        // SECURITY: Only delete if the item belongs to this user
        ConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
            ":userId": userId
        }
    };
    await docClient.delete(params).promise();
    return { id };
};

module.exports = {
    getAllMeals,
    createMeal,
    updateMeal,
    deleteMeal
};