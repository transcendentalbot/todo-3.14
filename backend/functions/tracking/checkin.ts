import { APIGatewayProxyHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { createResponse } from '../../utils/response';

const dynamodb = new AWS.DynamoDB.DocumentClient();
const TRACKING_TABLE = process.env.TRACKING_TABLE!;

interface CheckinData {
  type: 'morning' | 'evening';
  mood?: number; // 1-10
  energy?: number; // 1-10
  voiceNote?: string;
  happinessReflection?: string;
  challengeReflection?: string;
}

interface EncryptedRequest {
  timestamp?: number;
  encryptedData?: string;
}

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = event.requestContext.authorizer?.userId;
    if (!userId) {
      return createResponse(401, { message: 'Unauthorized' });
    }

    const body = JSON.parse(event.body || '{}') as EncryptedRequest | CheckinData;
    
    // Check if data is encrypted
    const isEncrypted = 'encryptedData' in body;
    
    if (isEncrypted) {
      // Store encrypted data as-is
      const timestamp = body.timestamp ? new Date(body.timestamp).toISOString() : new Date().toISOString();
      
      const item = {
        userId,
        timestamp,
        type: 'checkin',
        encryptedData: body.encryptedData
      };

      await dynamodb.put({
        TableName: TRACKING_TABLE,
        Item: item
      }).promise();

      return createResponse(201, {
        message: 'Check-in recorded successfully',
        timestamp
      });
    } else {
      // Legacy path for unencrypted data (for backward compatibility)
      const checkinData = body as CheckinData;
      
      // Validate mood and energy ratings
      if (checkinData.mood && (checkinData.mood < 1 || checkinData.mood > 10)) {
        return createResponse(400, { message: 'Mood must be between 1 and 10' });
      }
      if (checkinData.energy && (checkinData.energy < 1 || checkinData.energy > 10)) {
        return createResponse(400, { message: 'Energy must be between 1 and 10' });
      }

      const timestamp = new Date().toISOString();
      
      const item = {
        userId,
        timestamp,
        type: 'checkin',
        data: {
          ...checkinData,
          createdAt: timestamp
        }
      };

      await dynamodb.put({
        TableName: TRACKING_TABLE,
        Item: item
      }).promise();

      return createResponse(201, {
        message: 'Check-in recorded successfully',
        checkin: item
      });
    }

  } catch (error) {
    console.error('Check-in error:', error);
    return createResponse(500, { message: 'Internal server error' });
  }
};