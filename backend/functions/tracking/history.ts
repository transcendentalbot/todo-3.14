import { APIGatewayProxyHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { createResponse } from '../../utils/response';

const dynamodb = new AWS.DynamoDB.DocumentClient();
const TRACKING_TABLE = process.env.TRACKING_TABLE!;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = event.requestContext.authorizer?.userId;
    if (!userId) {
      return createResponse(401, { message: 'Unauthorized' });
    }

    // Get query parameters for date range
    const queryParams = event.queryStringParameters || {};
    const startDate = queryParams.startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(); // Default: last 7 days
    const endDate = queryParams.endDate || new Date().toISOString();

    // Query tracking data for the user
    const result = await dynamodb.query({
      TableName: TRACKING_TABLE,
      KeyConditionExpression: 'userId = :userId AND #ts BETWEEN :start AND :end',
      ExpressionAttributeNames: {
        '#ts': 'timestamp'
      },
      ExpressionAttributeValues: {
        ':userId': userId,
        ':start': startDate,
        ':end': endDate
      },
      ScanIndexForward: false // Most recent first
    }).promise();

    return createResponse(200, result.Items || []);

  } catch (error) {
    console.error('History fetch error:', error);
    return createResponse(500, { message: 'Internal server error' });
  }
};