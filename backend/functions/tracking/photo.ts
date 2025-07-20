import { APIGatewayProxyHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { createResponse } from '../../utils/response';

const dynamodb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();
const TRACKING_TABLE = process.env.TRACKING_TABLE!;
const PHOTOS_BUCKET = process.env.PHOTOS_BUCKET!;

interface PhotoData {
  photoType: 'selfie' | 'food';
  base64Image: string;
  mimeType: string;
  note?: string;
}

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = event.requestContext.authorizer?.userId;
    if (!userId) {
      return createResponse(401, { message: 'Unauthorized' });
    }

    const body = JSON.parse(event.body || '{}') as PhotoData;
    
    if (!body.base64Image || !body.mimeType || !body.photoType) {
      return createResponse(400, { 
        message: 'base64Image, mimeType, and photoType are required' 
      });
    }

    // Generate unique photo key
    const photoId = uuidv4();
    const extension = body.mimeType.split('/')[1] || 'jpg';
    const photoKey = `${userId}/${body.photoType}/${photoId}.${extension}`;

    // Upload photo to S3
    const buffer = Buffer.from(body.base64Image, 'base64');
    await s3.putObject({
      Bucket: PHOTOS_BUCKET,
      Key: photoKey,
      Body: buffer,
      ContentType: body.mimeType,
      Metadata: {
        userId,
        photoType: body.photoType
      }
    }).promise();

    // Generate signed URL for accessing the photo
    const photoUrl = s3.getSignedUrl('getObject', {
      Bucket: PHOTOS_BUCKET,
      Key: photoKey,
      Expires: 3600 // 1 hour
    });

    // Save tracking record
    const timestamp = new Date().toISOString();
    const item = {
      userId,
      timestamp,
      type: 'photo',
      data: {
        photoType: body.photoType,
        photoKey,
        photoUrl,
        note: body.note,
        createdAt: timestamp
      }
    };

    await dynamodb.put({
      TableName: TRACKING_TABLE,
      Item: item
    }).promise();

    return createResponse(201, {
      message: 'Photo uploaded successfully',
      photo: item
    });

  } catch (error) {
    console.error('Photo upload error:', error);
    return createResponse(500, { message: 'Internal server error' });
  }
};