import { APIGatewayProxyHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { createResponse, createErrorResponse } from '../../utils/response';

const dynamodb = new AWS.DynamoDB.DocumentClient();
const USER_CONTEXT_TABLE = process.env.USER_CONTEXT_TABLE!;
const JOURNAL_ENTRIES_TABLE = process.env.JOURNAL_ENTRIES_TABLE!;
const INSIGHT_QUEUE_TABLE = process.env.INSIGHT_QUEUE_TABLE!;

interface UserContext {
  recentMood: {
    dominant: string;
    average: number;
    trend: 'improving' | 'declining' | 'stable';
  };
  activeTopics: string[];
  behaviorPatterns: Array<{
    type: string;
    frequency: number;
    lastOccurrence: string;
  }>;
  pendingTasks: Array<{
    description: string;
    priority: string;
    scheduledFor: string;
  }>;
}

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = event.requestContext.authorizer?.userId;
    if (!userId) {
      return createErrorResponse(401, 'Unauthorized');
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

    // Get recent journal entries (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const entriesResult = await dynamodb.query({
      TableName: JOURNAL_ENTRIES_TABLE,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': `USER#${userId}`
      },
      ScanIndexForward: false,
      Limit: 50
    }).promise();

    // Filter to last 7 days
    const recentEntries = (entriesResult.Items || []).filter(item => 
      new Date(item.createdAt) > sevenDaysAgo
    );

    // Get pending tasks
    const tasksResult = await dynamodb.query({
      TableName: INSIGHT_QUEUE_TABLE,
      KeyConditionExpression: 'userId = :userId',
      FilterExpression: '#status = :status',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':userId': `USER#${userId}`,
        ':status': 'pending'
      },
      Limit: 20
    }).promise();

    // Analyze mood trend
    const moodTrend = analyzeMoodTrend(userContext.recentEmotions || []);
    
    // Extract active topics from recent entries
    const activeTopics = extractActiveTopics(recentEntries);
    
    // Identify behavior patterns
    const behaviorPatterns = identifyPatterns(recentEntries, userContext);

    const context: UserContext = {
      recentMood: moodTrend,
      activeTopics,
      behaviorPatterns,
      pendingTasks: (tasksResult.Items || []).map(task => ({
        description: task.description,
        priority: task.priority,
        scheduledFor: task.scheduledFor
      }))
    };

    // Cache the context
    await dynamodb.put({
      TableName: USER_CONTEXT_TABLE,
      Item: {
        userId: `USER#${userId}`,
        contextType: 'CONTEXT#cache',
        context,
        cachedAt: new Date().toISOString(),
        ttl: Math.floor(Date.now() / 1000) + 3600 // 1 hour cache
      }
    }).promise();

    return createResponse(200, context);
  } catch (error) {
    console.error('Error retrieving user context:', error);
    return createErrorResponse(500, 'Failed to retrieve user context');
  }
};

function analyzeMoodTrend(recentEmotions: any[]): UserContext['recentMood'] {
  if (recentEmotions.length === 0) {
    return {
      dominant: 'neutral',
      average: 5,
      trend: 'stable'
    };
  }

  // Count emotions
  const emotionCounts: Record<string, number> = {};
  let totalIntensity = 0;
  
  recentEmotions.forEach(e => {
    emotionCounts[e.emotion] = (emotionCounts[e.emotion] || 0) + 1;
    totalIntensity += e.intensity;
  });

  // Find dominant emotion
  const dominant = Object.entries(emotionCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'neutral';

  const average = totalIntensity / recentEmotions.length;

  // Analyze trend (compare first half vs second half)
  const midpoint = Math.floor(recentEmotions.length / 2);
  const firstHalf = recentEmotions.slice(0, midpoint);
  const secondHalf = recentEmotions.slice(midpoint);
  
  const firstAvg = firstHalf.reduce((sum, e) => sum + e.intensity, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, e) => sum + e.intensity, 0) / secondHalf.length;
  
  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  if (secondAvg > firstAvg + 1) trend = 'improving';
  else if (secondAvg < firstAvg - 1) trend = 'declining';

  return { dominant, average, trend };
}

function extractActiveTopics(entries: any[]): string[] {
  const topicCounts: Record<string, number> = {};
  
  entries.forEach(entry => {
    if (entry.extractedInsights) {
      try {
        const insights = JSON.parse(entry.extractedInsights);
        
        // Extract topics from emotions and tasks
        if (insights.emotion?.primaryEmotion) {
          topicCounts[insights.emotion.primaryEmotion] = 
            (topicCounts[insights.emotion.primaryEmotion] || 0) + 1;
        }
        
        if (insights.tasks) {
          insights.tasks.forEach((task: any) => {
            const words = task.context.toLowerCase().split(/\s+/);
            words.forEach((word: string) => {
              if (word.length > 4) { // Simple topic extraction
                topicCounts[word] = (topicCounts[word] || 0) + 1;
              }
            });
          });
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }
  });

  // Return top 5 topics
  return Object.entries(topicCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([topic]) => topic);
}

function identifyPatterns(entries: any[], context: any): UserContext['behaviorPatterns'] {
  const patterns: UserContext['behaviorPatterns'] = [];
  
  // Time-based patterns
  const timePatterns: Record<string, number> = {};
  entries.forEach(entry => {
    const hour = new Date(entry.createdAt).getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
    timePatterns[timeOfDay] = (timePatterns[timeOfDay] || 0) + 1;
  });

  Object.entries(timePatterns).forEach(([time, count]) => {
    if (count >= 3) { // At least 3 occurrences
      patterns.push({
        type: `${time}_journaling`,
        frequency: count,
        lastOccurrence: new Date().toISOString()
      });
    }
  });

  return patterns;
}