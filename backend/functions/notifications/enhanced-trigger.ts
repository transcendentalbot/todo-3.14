import { EventBridgeHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk';

const dynamodb = new AWS.DynamoDB.DocumentClient();
const lambda = new AWS.Lambda();

const USERS_TABLE = process.env.USERS_TABLE!;
const USER_CONTEXT_TABLE = process.env.USER_CONTEXT_TABLE!;

export const handler: EventBridgeHandler<string, any, void> = async (event) => {
  try {
    const notificationType = event['detail-type'] || event.detail?.['detail-type'] || event.detail?.type;
    
    console.log(`Processing ${notificationType} notifications`);

    // Get all active users
    const usersResult = await dynamodb.scan({
      TableName: USERS_TABLE,
      FilterExpression: 'attribute_exists(pushSubscription) OR attribute_exists(phone)'
    }).promise();

    const users = usersResult.Items || [];
    console.log(`Found ${users.length} users with notification settings`);

    // Process each user with personalized notifications
    const notificationPromises = users.map(async (user) => {
      try {
        // Get user context for personalization
        const contextResult = await dynamodb.get({
          TableName: USER_CONTEXT_TABLE,
          Key: {
            userId: `USER#${user.userId}`,
            contextType: 'CONTEXT#current'
          }
        }).promise();

        const userContext = contextResult.Item || {};

        // Check if user should receive this notification
        if (!shouldSendNotification(notificationType, userContext)) {
          console.log(`Skipping notification for user ${user.userId} based on context`);
          return;
        }

        // Send intelligent notification
        await lambda.invoke({
          FunctionName: 'wellness-companion-dev-intelligentNotificationSender',
          InvocationType: 'Event',
          Payload: JSON.stringify({
            body: JSON.stringify({
              userId: user.userId,
              notificationType,
              context: userContext
            })
          })
        }).promise();

      } catch (error) {
        console.error(`Failed to process notification for user ${user.userId}:`, error);
      }
    });

    await Promise.allSettled(notificationPromises);
    console.log(`Completed processing ${notificationType} notifications`);

  } catch (error) {
    console.error('Enhanced notification trigger error:', error);
    throw error;
  }
};

function shouldSendNotification(notificationType: string, userContext: any): boolean {
  // Skip morning check-in if user already checked in today
  if (notificationType === 'morning' && userContext.lastCheckin) {
    const lastCheckin = new Date(userContext.lastCheckin);
    const today = new Date();
    if (lastCheckin.toDateString() === today.toDateString()) {
      return false;
    }
  }

  // Skip supplement reminder if already taken
  if (notificationType === 'supplement' && userContext.supplementsTaken) {
    const takenDate = new Date(userContext.supplementsTaken);
    const today = new Date();
    if (takenDate.toDateString() === today.toDateString()) {
      return false;
    }
  }

  // Adjust evening notification based on mood
  if (notificationType === 'evening' && userContext.emotionalProfile) {
    const avgIntensity = userContext.emotionalProfile.averageIntensity || 5;
    // Skip if user is having a really tough day (intensity > 8)
    if (avgIntensity > 8) {
      return false; // Give them space
    }
  }

  // Check notification preferences
  if (userContext.notificationPreferences) {
    const prefs = userContext.notificationPreferences;
    if (prefs.disabledTypes?.includes(notificationType)) {
      return false;
    }
    if (prefs.quietHours) {
      const now = new Date();
      const hour = now.getHours();
      if (hour >= prefs.quietHours.start || hour < prefs.quietHours.end) {
        return false;
      }
    }
  }

  return true;
}