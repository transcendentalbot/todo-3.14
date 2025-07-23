import { APIGatewayProxyHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import * as webpush from 'web-push';
import { createResponse, createErrorResponse } from '../../utils/response';

const dynamodb = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS();

const USERS_TABLE = process.env.USERS_TABLE!;
const USER_CONTEXT_TABLE = process.env.USER_CONTEXT_TABLE!;
const INSIGHT_QUEUE_TABLE = process.env.INSIGHT_QUEUE_TABLE!;

// Configure web-push
webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

interface NotificationContent {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
}

export const sendIntelligentNotification: APIGatewayProxyHandler = async (event) => {
  try {
    const { userId, notificationType, taskId } = JSON.parse(event.body || '{}');
    
    if (!userId || !notificationType) {
      return createErrorResponse(400, 'User ID and notification type are required');
    }

    // Get user context
    const contextResult = await dynamodb.get({
      TableName: USER_CONTEXT_TABLE,
      Key: {
        userId: `USER#${userId}`,
        contextType: 'CONTEXT#current'
      }
    }).promise();

    const userContext = contextResult.Item || {};

    // Get user preferences and push subscription
    const userResult = await dynamodb.get({
      TableName: USERS_TABLE,
      Key: { userId }
    }).promise();

    const user = userResult.Item;
    if (!user) {
      return createErrorResponse(404, 'User not found');
    }

    // Generate personalized notification content
    const notificationContent = await generatePersonalizedContent(
      notificationType,
      userContext,
      taskId
    );

    // Send notification via preferred channel
    let sent = false;
    
    if (user.pushSubscription) {
      try {
        await webpush.sendNotification(
          user.pushSubscription,
          JSON.stringify(notificationContent)
        );
        sent = true;
      } catch (error) {
        console.error('Push notification failed:', error);
      }
    }

    // Fallback to SMS for high-priority notifications
    if (!sent && user.phone && isHighPriority(notificationType, userContext)) {
      try {
        await sns.publish({
          PhoneNumber: user.phone,
          Message: `${notificationContent.title}\n\n${notificationContent.body}`
        }).promise();
        sent = true;
      } catch (error) {
        console.error('SMS fallback failed:', error);
      }
    }

    // Log notification attempt
    await logNotification(userId, notificationType, sent, notificationContent);

    return createResponse(200, {
      sent,
      channel: sent ? (user.pushSubscription ? 'push' : 'sms') : 'none',
      content: notificationContent
    });
  } catch (error) {
    console.error('Error sending intelligent notification:', error);
    return createErrorResponse(500, 'Failed to send notification');
  }
};

async function generatePersonalizedContent(
  notificationType: string,
  userContext: any,
  taskId?: string
): Promise<NotificationContent> {
  const mood = userContext.emotionalProfile?.dominantEmotion || 'neutral';
  const recentPatterns = userContext.recentPatterns || {};
  const timeOfDay = getTimeOfDay();
  
  // Base templates
  const templates: Record<string, any> = {
    morning_checkin: {
      neutral: {
        title: "Good morning! ☀️",
        body: "How are you feeling today? Take a moment to check in."
      },
      happy: {
        title: "Rise and shine! 🌟",
        body: "Yesterday was great! Let's capture today's energy too."
      },
      anxious: {
        title: "Good morning 💙",
        body: "New day, fresh start. How are you feeling?"
      },
      sad: {
        title: "Morning check-in",
        body: "Taking it one day at a time. How's today looking?"
      }
    },
    evening_reflection: {
      neutral: {
        title: "Evening reflection time",
        body: "What made today meaningful for you?"
      },
      happy: {
        title: "Capture today's joy! ✨",
        body: "What moments brought you happiness today?"
      },
      anxious: {
        title: "Wind down time",
        body: "Let's process today together. What's on your mind?"
      },
      sad: {
        title: "Gentle evening check-in",
        body: "How was your day? Remember, tomorrow is a new beginning."
      }
    },
    task_reminder: {
      default: {
        title: "Gentle reminder",
        body: "You mentioned this was important to you"
      }
    },
    supplement_reminder: {
      consistent: {
        title: "Supplement time! 💊",
        body: "Keep up your great routine!"
      },
      inconsistent: {
        title: "Quick reminder",
        body: "Don't forget your supplements today"
      }
    }
  };

  // Get base template
  let content = templates[notificationType]?.[mood] || 
                templates[notificationType]?.default ||
                { title: "Wellness Check", body: "Time for your wellness check-in" };

  // Personalize based on patterns
  if (notificationType === 'task_reminder' && taskId) {
    // Get task details
    const taskResult = await dynamodb.get({
      TableName: INSIGHT_QUEUE_TABLE,
      Key: {
        userId: userContext.userId,
        taskId
      }
    }).promise();

    if (taskResult.Item) {
      content.body = taskResult.Item.description;
      content.data = {
        taskId,
        context: taskResult.Item.context
      };
    }
  }

  // Add contextual elements
  if (userContext.behaviorPatterns?.some((p: any) => p.type === 'streak')) {
    content.body += " 🔥 Keep your streak going!";
  }

  return content;
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

function isHighPriority(notificationType: string, context: any): boolean {
  // High priority if user is in a difficult emotional state
  if (context.emotionalProfile?.averageIntensity > 7) return true;
  
  // High priority for certain notification types
  const highPriorityTypes = ['crisis_support', 'medication_reminder'];
  if (highPriorityTypes.includes(notificationType)) return true;
  
  return false;
}

async function logNotification(
  userId: string,
  notificationType: string,
  sent: boolean,
  content: NotificationContent
) {
  try {
    await dynamodb.put({
      TableName: USER_CONTEXT_TABLE,
      Item: {
        userId: `USER#${userId}`,
        contextType: `NOTIFICATION#${Date.now()}`,
        notificationType,
        sent,
        content,
        timestamp: new Date().toISOString(),
        ttl: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
      }
    }).promise();
  } catch (error) {
    console.error('Failed to log notification:', error);
  }
}