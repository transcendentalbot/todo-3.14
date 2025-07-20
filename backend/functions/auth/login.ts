import { APIGatewayProxyHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { createResponse } from '../../utils/response';

const dynamodb = new AWS.DynamoDB.DocumentClient();
const USERS_TABLE = process.env.USERS_TABLE!;
const JWT_SECRET = process.env.JWT_SECRET!;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return createResponse(400, { message: 'Email and password are required' });
    }

    // Find user by email
    const result = await dynamodb.query({
      TableName: USERS_TABLE,
      IndexName: 'email-index',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email.toLowerCase()
      }
    }).promise();

    if (!result.Items || result.Items.length === 0) {
      return createResponse(401, { message: 'Invalid credentials' });
    }

    const user = result.Items[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return createResponse(401, { message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.userId,
        email: user.email
      },
      JWT_SECRET,
      {
        expiresIn: '7d'
      }
    );

    // Update last login
    await dynamodb.update({
      TableName: USERS_TABLE,
      Key: { userId: user.userId },
      UpdateExpression: 'SET lastLogin = :timestamp',
      ExpressionAttributeValues: {
        ':timestamp': new Date().toISOString()
      }
    }).promise();

    // Return success (without password hash)
    const { passwordHash, ...userWithoutPassword } = user;
    return createResponse(200, {
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    return createResponse(500, { message: 'Internal server error' });
  }
};