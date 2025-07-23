import { APIGatewayProxyHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { createResponse, createErrorResponse } from '../../utils/response';
import { generateEmbedding } from '../../services/bedrock';

const dynamodb = new AWS.DynamoDB.DocumentClient();
const JOURNAL_ENTRIES_TABLE = process.env.JOURNAL_ENTRIES_TABLE!;

// Calculate cosine similarity between two vectors
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = event.requestContext.authorizer?.userId;
    if (!userId) {
      return createErrorResponse(401, 'Unauthorized');
    }

    const { query, limit = 10, threshold = 0.7 } = JSON.parse(event.body || '{}');
    
    if (!query) {
      return createErrorResponse(400, 'Search query is required');
    }

    // Generate embedding for the search query
    const queryEmbedding = await generateEmbedding(query);
    
    if (!queryEmbedding) {
      return createErrorResponse(500, 'Failed to process search query');
    }

    // Get all user's journal entries (in production, use pagination)
    const entriesResult = await dynamodb.query({
      TableName: JOURNAL_ENTRIES_TABLE,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': `USER#${userId}`
      },
      Limit: 100 // Limit to recent 100 entries for performance
    }).promise();

    if (!entriesResult.Items || entriesResult.Items.length === 0) {
      return createResponse(200, { entries: [] });
    }

    // Calculate similarity scores for entries with embeddings
    const scoredEntries = entriesResult.Items
      .filter(item => item.embedding && item.embedding.length > 0)
      .map(item => {
        const similarity = cosineSimilarity(queryEmbedding, item.embedding);
        return {
          entryId: item.entryId.replace('ENTRY#', ''),
          encryptedContent: item.encryptedContent,
          metadata: item.metadata,
          createdAt: item.createdAt,
          similarity: similarity,
          extractedInsights: item.extractedInsights
        };
      })
      .filter(entry => entry.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return createResponse(200, {
      query,
      entries: scoredEntries,
      count: scoredEntries.length
    });
  } catch (error) {
    console.error('Error searching journal entries:', error);
    return createErrorResponse(500, 'Failed to search journal entries');
  }
};