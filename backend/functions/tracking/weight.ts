import { APIGatewayProxyHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { createResponse } from '../../utils/response';
import { EncryptedRequest, isEncryptedRequest, handleEncryptedData } from '../../utils/encryption';

const dynamodb = new AWS.DynamoDB.DocumentClient();
const TRACKING_TABLE = process.env.TRACKING_TABLE!;

interface WeightData {
  weight: number;
  unit: 'lbs' | 'kg';
  note?: string;
}

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = event.requestContext.authorizer?.userId;
    if (!userId) {
      return createResponse(401, { message: 'Unauthorized' });
    }

    const body = JSON.parse(event.body || '{}') as EncryptedRequest | WeightData;
    
    // Handle encrypted data
    if (isEncryptedRequest(body)) {
      const item = handleEncryptedData(userId, 'weight', body);
      
      await dynamodb.put({
        TableName: TRACKING_TABLE,
        Item: item
      }).promise();

      return createResponse(201, {
        message: 'Weight recorded successfully',
        timestamp: item.timestamp
      });
    }
    
    // Legacy unencrypted path
    const weightData = body as WeightData;
    
    if (!weightData.weight || !weightData.unit) {
      return createResponse(400, { message: 'Weight and unit are required' });
    }

    if (weightData.weight <= 0 || weightData.weight > 1000) {
      return createResponse(400, { message: 'Weight must be between 0 and 1000' });
    }

    const timestamp = new Date().toISOString();
    
    const item = {
      userId,
      timestamp,
      type: 'weight',
      data: {
        weight: weightData.weight,
        unit: weightData.unit,
        note: weightData.note,
        createdAt: timestamp
      }
    };

    await dynamodb.put({
      TableName: TRACKING_TABLE,
      Item: item
    }).promise();

    return createResponse(201, {
      message: 'Weight recorded successfully',
      weight: item
    });

  } catch (error) {
    console.error('Weight tracking error:', error);
    return createResponse(500, { message: 'Internal server error' });
  }
};