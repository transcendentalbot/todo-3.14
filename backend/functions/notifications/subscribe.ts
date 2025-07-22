import { APIGatewayProxyHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { createResponse } from '../../utils/response';

const dynamodb = new AWS.DynamoDB.DocumentClient();
const USERS_TABLE = process.env.USERS_TABLE!;

interface SubscriptionRequest {
  subscription: PushSubscription;
  phone?: string;
}

interface PushSubscription {
  endpoint: string;
  expirationTime?: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = event.requestContext.authorizer?.userId;
    if (!userId) {
      return createResponse(401, { message: 'Unauthorized' });
    }

    const body = JSON.parse(event.body || '{}') as SubscriptionRequest;
    
    if (!body.subscription || !body.subscription.endpoint || !body.subscription.keys) {
      return createResponse(400, { message: 'Valid push subscription required' });
    }

    // Update user with push subscription and optional phone number
    let updateExpression = 'SET pushSubscription = :subscription';
    const expressionAttributeValues: any = {
      ':subscription': body.subscription
    };

    if (body.phone) {
      updateExpression += ', phone = :phone';
      expressionAttributeValues[':phone'] = body.phone;
    }

    await dynamodb.update({
      TableName: USERS_TABLE,
      Key: { userId },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues
    }).promise();

    return createResponse(200, {
      message: 'Notification subscription saved successfully'
    });

  } catch (error) {
    console.error('Subscription error:', error);
    return createResponse(500, { message: 'Internal server error' });
  }
};