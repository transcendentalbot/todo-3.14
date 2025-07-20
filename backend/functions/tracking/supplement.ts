import { APIGatewayProxyHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { createResponse } from '../../utils/response';

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

    const body = JSON.parse(event.body || '{}') as SupplementData;
    
    if (typeof body.taken !== 'boolean') {
      return createResponse(400, { message: 'taken field is required as boolean' });
    }

    const timestamp = new Date().toISOString();
    
    const item = {
      userId,
      timestamp,
      type: 'supplement',
      data: {
        taken: body.taken,
        supplements: body.supplements || [],
        note: body.note,
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