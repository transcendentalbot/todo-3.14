import { APIGatewayProxyHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { createResponse } from '../../utils/response';
import { validateEmail, validatePassword } from '../../utils/validation';

const dynamodb = new AWS.DynamoDB.DocumentClient();
const USERS_TABLE = process.env.USERS_TABLE!;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return createResponse(400, { message: 'Email and password are required' });
    }

    if (!validateEmail(email)) {
      return createResponse(400, { message: 'Invalid email format' });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return createResponse(400, { message: passwordError });
    }

    // Check if user already exists
    const existingUser = await dynamodb.query({
      TableName: USERS_TABLE,
      IndexName: 'email-index',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email.toLowerCase()
      }
    }).promise();

    if (existingUser.Items && existingUser.Items.length > 0) {
      return createResponse(409, { message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userId = uuidv4();
    const timestamp = new Date().toISOString();
    
    const user = {
      userId,
      email: email.toLowerCase(),
      passwordHash: hashedPassword,
      createdAt: timestamp,
      updatedAt: timestamp,
      preferences: {
        notifications: {
          morning: '07:00',
          lunch: '12:00',
          evening: '18:00',
          night: '21:00'
        },
        timezone: 'America/New_York'
      }
    };

    await dynamodb.put({
      TableName: USERS_TABLE,
      Item: user
    }).promise();

    // Return success (without password hash)
    const { passwordHash, ...userWithoutPassword } = user;
    return createResponse(201, {
      message: 'User created successfully',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Registration error:', error);
    return createResponse(500, { message: 'Internal server error' });
  }
};