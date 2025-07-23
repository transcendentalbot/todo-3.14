import { APIGatewayProxyHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { createResponse, createErrorResponse } from '../../utils/response';

const dynamodb = new AWS.DynamoDB.DocumentClient();
const JOURNAL_ENTRIES_TABLE = process.env.JOURNAL_ENTRIES_TABLE!;

// Create a new journal entry
export const createEntry: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = event.requestContext.authorizer?.userId;
    if (!userId) {
      return createErrorResponse(401, 'Unauthorized');
    }

    const body = JSON.parse(event.body || '{}');
    const { encryptedContent, metadata } = body;

    if (!encryptedContent) {
      return createErrorResponse(400, 'Encrypted content is required');
    }

    const entryId = `ENTRY#${Date.now()}`;
    const timestamp = new Date().toISOString();
    const ttl = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60); // 30 days

    const entry = {
      userId: `USER#${userId}`,
      entryId,
      encryptedContent,
      metadata: metadata || {},
      createdAt: timestamp,
      updatedAt: timestamp,
      ttl
    };

    await dynamodb.put({
      TableName: JOURNAL_ENTRIES_TABLE,
      Item: entry
    }).promise();

    return createResponse(201, {
      entryId: entryId.replace('ENTRY#', ''),
      createdAt: timestamp
    });
  } catch (error) {
    console.error('Error creating journal entry:', error);
    return createErrorResponse(500, 'Failed to create journal entry');
  }
};

// Get all journal entries for a user
export const getEntries: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = event.requestContext.authorizer?.userId;
    if (!userId) {
      return createErrorResponse(401, 'Unauthorized');
    }

    const limit = parseInt(event.queryStringParameters?.limit || '20');
    const lastEvaluatedKey = event.queryStringParameters?.lastKey;

    const params: AWS.DynamoDB.DocumentClient.QueryInput = {
      TableName: JOURNAL_ENTRIES_TABLE,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': `USER#${user.userId}`
      },
      ScanIndexForward: false, // Most recent first
      Limit: limit
    };

    if (lastEvaluatedKey) {
      params.ExclusiveStartKey = JSON.parse(Buffer.from(lastEvaluatedKey, 'base64').toString());
    }

    const result = await dynamodb.query(params).promise();

    const entries = result.Items?.map(item => ({
      entryId: item.entryId.replace('ENTRY#', ''),
      encryptedContent: item.encryptedContent,
      metadata: item.metadata,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    })) || [];

    const response: any = { entries };
    
    if (result.LastEvaluatedKey) {
      response.lastKey = Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64');
    }

    return createResponse(200, response);
  } catch (error) {
    console.error('Error getting journal entries:', error);
    return createErrorResponse(500, 'Failed to get journal entries');
  }
};

// Get a single journal entry
export const getEntry: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = event.requestContext.authorizer?.userId;
    if (!userId) {
      return createErrorResponse(401, 'Unauthorized');
    }

    const entryId = event.pathParameters?.entryId;
    if (!entryId) {
      return createErrorResponse(400, 'Entry ID is required');
    }

    const result = await dynamodb.get({
      TableName: JOURNAL_ENTRIES_TABLE,
      Key: {
        userId: `USER#${userId}`,
        entryId: `ENTRY#${entryId}`
      }
    }).promise();

    if (!result.Item) {
      return createErrorResponse(404, 'Journal entry not found');
    }

    const entry = {
      entryId: result.Item.entryId.replace('ENTRY#', ''),
      encryptedContent: result.Item.encryptedContent,
      metadata: result.Item.metadata,
      createdAt: result.Item.createdAt,
      updatedAt: result.Item.updatedAt
    };

    return createResponse(200, entry);
  } catch (error) {
    console.error('Error getting journal entry:', error);
    return createErrorResponse(500, 'Failed to get journal entry');
  }
};

// Update a journal entry
export const updateEntry: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = event.requestContext.authorizer?.userId;
    if (!userId) {
      return createErrorResponse(401, 'Unauthorized');
    }

    const entryId = event.pathParameters?.entryId;
    if (!entryId) {
      return createErrorResponse(400, 'Entry ID is required');
    }

    const body = JSON.parse(event.body || '{}');
    const { encryptedContent, metadata } = body;

    if (!encryptedContent) {
      return createErrorResponse(400, 'Encrypted content is required');
    }

    const timestamp = new Date().toISOString();

    const result = await dynamodb.update({
      TableName: JOURNAL_ENTRIES_TABLE,
      Key: {
        userId: `USER#${userId}`,
        entryId: `ENTRY#${entryId}`
      },
      UpdateExpression: 'SET encryptedContent = :content, metadata = :metadata, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':content': encryptedContent,
        ':metadata': metadata || {},
        ':updatedAt': timestamp
      },
      ReturnValues: 'ALL_NEW'
    }).promise();

    if (!result.Attributes) {
      return createErrorResponse(404, 'Journal entry not found');
    }

    return createResponse(200, {
      message: 'Journal entry updated successfully',
      updatedAt: timestamp
    });
  } catch (error) {
    console.error('Error updating journal entry:', error);
    return createErrorResponse(500, 'Failed to update journal entry');
  }
};

// Delete a journal entry
export const deleteEntry: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = event.requestContext.authorizer?.userId;
    if (!userId) {
      return createErrorResponse(401, 'Unauthorized');
    }

    const entryId = event.pathParameters?.entryId;
    if (!entryId) {
      return createErrorResponse(400, 'Entry ID is required');
    }

    await dynamodb.delete({
      TableName: JOURNAL_ENTRIES_TABLE,
      Key: {
        userId: `USER#${userId}`,
        entryId: `ENTRY#${entryId}`
      }
    }).promise();

    return createResponse(200, {
      message: 'Journal entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    return createErrorResponse(500, 'Failed to delete journal entry');
  }
};