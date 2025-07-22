import { APIGatewayProxyHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import * as webpush from 'web-push';
import { createResponse } from '../../utils/response';

const dynamodb = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS();
const USERS_TABLE = process.env.USERS_TABLE!;

// Configure web-push with VAPID details
webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

interface NotificationRequest {
  userId: string;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  actions?: Array<{
    action: string;
    title: string;
  }>;
  data?: any;
  requireInteraction?: boolean;
  urgency?: 'very-low' | 'low' | 'normal' | 'high';
}

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}') as NotificationRequest;
    
    if (!body.userId || !body.title || !body.body) {
      return createResponse(400, { message: 'userId, title, and body are required' });
    }

    // Get user's push subscription and phone
    const userResult = await dynamodb.get({
      TableName: USERS_TABLE,
      Key: { userId: body.userId }
    }).promise();

    if (!userResult.Item) {
      return createResponse(404, { message: 'User not found' });
    }

    const user = userResult.Item;
    const pushSubscription = user.pushSubscription;
    const phone = user.phone;

    let pushSuccess = false;
    let pushError = null;

    // Try push notification first
    if (pushSubscription) {
      try {
        const payload = JSON.stringify({
          title: body.title,
          body: body.body,
          icon: body.icon || '/icon-192x192.png',
          badge: body.badge || '/icon-192x192.png',
          actions: body.actions,
          data: body.data,
          requireInteraction: body.requireInteraction || false,
          timestamp: Date.now()
        });

        const options = {
          urgency: body.urgency || 'normal',
          TTL: 60 * 60 * 24 // 24 hours
        };

        await webpush.sendNotification(pushSubscription, payload, options);
        pushSuccess = true;
      } catch (error: any) {
        pushError = error;
        console.error('Push notification failed:', error);
        
        // If subscription is invalid, remove it
        if (error.statusCode === 410) {
          await dynamodb.update({
            TableName: USERS_TABLE,
            Key: { userId: body.userId },
            UpdateExpression: 'REMOVE pushSubscription'
          }).promise();
        }
      }
    }

    // SMS fallback for critical notifications
    if (!pushSuccess && phone && body.urgency === 'high') {
      try {
        await sns.publish({
          PhoneNumber: phone,
          Message: `${body.title}: ${body.body}`,
          MessageAttributes: {
            'AWS.SNS.SMS.SMSType': {
              DataType: 'String',
              StringValue: 'Transactional'
            }
          }
        }).promise();

        return createResponse(200, {
          message: 'Notification sent via SMS fallback',
          method: 'sms'
        });
      } catch (smsError) {
        console.error('SMS fallback failed:', smsError);
        return createResponse(500, {
          message: 'Failed to send notification',
          error: 'Both push and SMS failed'
        });
      }
    }

    if (pushSuccess) {
      return createResponse(200, {
        message: 'Push notification sent successfully',
        method: 'push'
      });
    } else {
      return createResponse(500, {
        message: 'Failed to send push notification',
        error: pushError?.message || 'No subscription available'
      });
    }

  } catch (error) {
    console.error('Notification handler error:', error);
    return createResponse(500, { message: 'Internal server error' });
  }
};