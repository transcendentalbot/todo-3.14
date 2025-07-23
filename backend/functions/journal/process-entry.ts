import { APIGatewayProxyHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { analyzeJournalEmotion, extractTasks, generateEmbedding } from '../../services/bedrock';
import { createResponse, createErrorResponse } from '../../utils/response';

const dynamodb = new AWS.DynamoDB.DocumentClient();
const JOURNAL_ENTRIES_TABLE = process.env.JOURNAL_ENTRIES_TABLE!;
const USER_CONTEXT_TABLE = process.env.USER_CONTEXT_TABLE!;
const INSIGHT_QUEUE_TABLE = process.env.INSIGHT_QUEUE_TABLE!;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = event.requestContext.authorizer?.userId;
    if (!userId) {
      return createErrorResponse(401, 'Unauthorized');
    }

    const { entryId, content } = JSON.parse(event.body || '{}');
    
    if (!entryId || !content) {
      return createErrorResponse(400, 'Entry ID and content are required');
    }

    // Process in parallel for efficiency
    const [emotionAnalysis, extractedTasks, embedding] = await Promise.all([
      analyzeJournalEmotion(content),
      extractTasks(content),
      generateEmbedding(content)
    ]);

    // Update journal entry with insights
    if (emotionAnalysis || extractedTasks.length > 0 || embedding) {
      const updateParams: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
        TableName: JOURNAL_ENTRIES_TABLE,
        Key: {
          userId: `USER#${userId}`,
          entryId: `ENTRY#${entryId}`
        },
        UpdateExpression: 'SET extractedInsights = :insights, embedding = :embedding, #metadata = :metadata',
        ExpressionAttributeNames: {
          '#metadata': 'metadata'
        },
        ExpressionAttributeValues: {
          ':insights': JSON.stringify({
            emotion: emotionAnalysis,
            tasks: extractedTasks,
            processedAt: new Date().toISOString()
          }),
          ':embedding': embedding || [],
          ':metadata': {
            emotion: emotionAnalysis?.primaryEmotion,
            emotionIntensity: emotionAnalysis?.emotionIntensity,
            sentiment: emotionAnalysis?.sentiment,
            hasInsights: true,
            taskCount: extractedTasks.length
          }
        }
      };

      await dynamodb.update(updateParams).promise();
    }

    // Create tasks in insight queue if any were extracted
    if (extractedTasks.length > 0) {
      const taskPromises = extractedTasks.map(async (task) => {
        const taskId = `TASK#${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const scheduledFor = determineScheduleTime(task.priority);

        return dynamodb.put({
          TableName: INSIGHT_QUEUE_TABLE,
          Item: {
            userId: `USER#${userId}`,
            taskId,
            taskType: 'journal_task',
            description: task.description,
            context: task.context,
            priority: task.priority,
            scheduledFor,
            status: 'pending',
            sourceEntryId: entryId,
            createdAt: new Date().toISOString()
          }
        }).promise();
      });

      await Promise.all(taskPromises);
    }

    // Update user context with recent patterns
    if (emotionAnalysis) {
      await updateUserContext(userId, emotionAnalysis);
    }

    return createResponse(200, {
      message: 'Journal entry processed successfully',
      insights: {
        emotion: emotionAnalysis,
        taskCount: extractedTasks.length,
        suggestedSupport: emotionAnalysis?.suggestedSupport
      }
    });
  } catch (error) {
    console.error('Error processing journal entry:', error);
    return createErrorResponse(500, 'Failed to process journal entry');
  }
};

function determineScheduleTime(priority: string): string {
  const now = new Date();
  
  switch (priority) {
    case 'high':
      // Schedule for tomorrow morning
      now.setDate(now.getDate() + 1);
      now.setHours(9, 0, 0, 0);
      break;
    case 'medium':
      // Schedule for in 3 days
      now.setDate(now.getDate() + 3);
      now.setHours(14, 0, 0, 0);
      break;
    case 'low':
      // Schedule for next week
      now.setDate(now.getDate() + 7);
      now.setHours(10, 0, 0, 0);
      break;
  }
  
  return now.toISOString();
}

async function updateUserContext(userId: string, emotionAnalysis: any) {
  try {
    const contextKey = {
      userId: `USER#${userId}`,
      contextType: 'CONTEXT#current'
    };

    // Get current context
    const currentContext = await dynamodb.get({
      TableName: USER_CONTEXT_TABLE,
      Key: contextKey
    }).promise();

    const recentEmotions = currentContext.Item?.recentEmotions || [];
    recentEmotions.unshift({
      emotion: emotionAnalysis.primaryEmotion,
      intensity: emotionAnalysis.emotionIntensity,
      sentiment: emotionAnalysis.sentiment,
      timestamp: new Date().toISOString()
    });

    // Keep only last 30 days of emotions
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const filteredEmotions = recentEmotions.filter((e: any) => 
      new Date(e.timestamp) > thirtyDaysAgo
    );

    // Calculate emotional patterns
    const emotionCounts: Record<string, number> = {};
    let totalIntensity = 0;
    
    filteredEmotions.forEach((e: any) => {
      emotionCounts[e.emotion] = (emotionCounts[e.emotion] || 0) + 1;
      totalIntensity += e.intensity;
    });

    const dominantEmotion = Object.entries(emotionCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0];

    await dynamodb.put({
      TableName: USER_CONTEXT_TABLE,
      Item: {
        ...contextKey,
        recentEmotions: filteredEmotions.slice(0, 100), // Keep last 100
        emotionalProfile: {
          dominantEmotion,
          averageIntensity: totalIntensity / filteredEmotions.length,
          emotionDistribution: emotionCounts,
          lastUpdated: new Date().toISOString()
        },
        lastUpdated: new Date().toISOString()
      }
    }).promise();
  } catch (error) {
    console.error('Error updating user context:', error);
  }
}