import { APIGatewayProxyHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { createResponse } from '../../utils/response';

const dynamodb = new AWS.DynamoDB.DocumentClient();
const USERS_TABLE = process.env.USERS_TABLE!;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    // Get userId from authorizer context
    const userId = event.requestContext.authorizer?.userId;
    
    if (!userId) {
      return createResponse(401, { message: 'Unauthorized' });
    }

    // Get user from database
    const result = await dynamodb.get({
      TableName: USERS_TABLE,
      Key: { userId }
    }).promise();

    if (!result.Item) {
      return createResponse(404, { message: 'User not found' });
    }

    // Return user (without password hash)
    const { passwordHash, ...userWithoutPassword } = result.Item;
    return createResponse(200, {
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Profile error:', error);
    return createResponse(500, { message: 'Internal server error' });
  }
};