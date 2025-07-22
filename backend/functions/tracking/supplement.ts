import { APIGatewayProxyHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { createResponse } from '../../utils/response';
import { EncryptedRequest, isEncryptedRequest, handleEncryptedData } from '../../utils/encryption';

const dynamodb = new AWS.DynamoDB.DocumentClient();
const TRACKING_TABLE = process.env.TRACKING_TABLE!;

interface SupplementData {
  taken: boolean;
  supplements?: string[];
  note?: string;
}

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = event.requestContext.authorizer?.userId;
    if (!userId) {
      return createResponse(401, { message: 'Unauthorized' });
    }

    const body = JSON.parse(event.body || '{}') as EncryptedRequest | SupplementData;
    
    // Handle encrypted data
    if (isEncryptedRequest(body)) {
      const item = handleEncryptedData(userId, 'supplement', body);
      
      await dynamodb.put({
        TableName: TRACKING_TABLE,
        Item: item
      }).promise();

      return createResponse(201, {
        message: 'Supplement log recorded successfully',
        timestamp: item.timestamp
      });
    }
    
    // Legacy unencrypted path
    const supplementData = body as SupplementData;
    
    if (typeof supplementData.taken !== 'boolean') {
      return createResponse(400, { message: 'taken field is required as boolean' });
    }

    const timestamp = new Date().toISOString();
    
    const item = {
      userId,
      timestamp,
      type: 'supplement',
      data: {
        taken: supplementData.taken,
        supplements: supplementData.supplements || [],
        note: supplementData.note,
        createdAt: timestamp
      }
    };

    await dynamodb.put({
      TableName: TRACKING_TABLE,
      Item: item
    }).promise();

    return createResponse(201, {
      message: 'Supplement tracking recorded successfully',
      supplement: item
    });

  } catch (error) {
    console.error('Supplement tracking error:', error);
    return createResponse(500, { message: 'Internal server error' });
  }
};