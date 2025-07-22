import { EventBridgeHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import * as webpush from 'web-push';

const dynamodb = new AWS.DynamoDB.DocumentClient();
const lambda = new AWS.Lambda();
const USERS_TABLE = process.env.USERS_TABLE!;

// Configure web-push
webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

interface NotificationSchedule {
  type: 'morning' | 'lunch' | 'supplement' | 'evening';
  title: string;
  body: string;
  actions: Array<{ action: string; title: string }>;
  data: any;
}

const notificationTemplates: Record<string, NotificationSchedule> = {
  morning: {
    type: 'morning',
    title: 'Good Morning! 🌅',
    body: 'How are you feeling today? Log your morning mood and energy.',
    actions: [
      { action: 'complete', title: 'Check In' },
      { action: 'snooze', title: 'Later' }
    ],
    data: { type: 'checkin', url: '/checkin' }
  },
  lunch: {
    type: 'lunch',
    title: 'Lunch Time! 🍽️',
    body: 'Don\'t forget to take a photo of your meal.',
    actions: [
      { action: 'complete', title: 'Take Photo' },
      { action: 'snooze', title: 'Skip' }
    ],
    data: { type: 'photo', url: '/photo' }
  },
  supplement: {
    type: 'supplement',
    title: 'Supplement Reminder 💊',
    body: 'Time for your evening supplements!',
    actions: [
      { action: 'complete', title: 'Taken' },
      { action: 'snooze', title: 'Remind Later' }
    ],
    data: { type: 'supplement', url: '/quick-log' }
  },
  evening: {
    type: 'evening',
    title: 'Evening Reflection 🌙',
    body: 'What brought you joy today? Take a moment to reflect.',
    actions: [
      { action: 'complete', title: 'Journal' },
      { action: 'snooze', title: 'Later' }
    ],
    data: { type: 'journal', url: '/checkin?type=evening' }
  }
};

export const handler: EventBridgeHandler<string, any, void> = async (event) => {
  try {
    // Get notification type from event detail
    const notificationType = event.detail?.type || event['detail-type'];
    const template = notificationTemplates[notificationType];
    
    if (!template) {
      console.error('Unknown notification type:', notificationType);
      return;
    }

    console.log(`Processing ${notificationType} notifications`);

    // Get all active users
    const usersResult = await dynamodb.scan({
      TableName: USERS_TABLE,
      FilterExpression: 'attribute_exists(pushSubscription) OR attribute_exists(phone)'
    }).promise();

    const users = usersResult.Items || [];
    console.log(`Found ${users.length} users with notification settings`);

    // Send notifications to each user
    const notificationPromises = users.map(async (user) => {
      try {
        // Invoke notification handler for each user
        await lambda.invoke({
          FunctionName: process.env.NOTIFICATION_HANDLER_FUNCTION!,
          InvocationType: 'Event', // Async invocation
          Payload: JSON.stringify({
            body: JSON.stringify({
              userId: user.userId,
              title: template.title,
              body: template.body,
              actions: template.actions,
              data: {
                ...template.data,
                token: user.token // Include user token for API calls
              },
              urgency: notificationType === 'supplement' ? 'high' : 'normal'
            })
          })
        }).promise();
      } catch (error) {
        console.error(`Failed to send notification to user ${user.userId}:`, error);
      }
    });

    await Promise.allSettled(notificationPromises);
    console.log(`Completed sending ${notificationType} notifications`);

  } catch (error) {
    console.error('Scheduled notification error:', error);
    throw error;
  }
};