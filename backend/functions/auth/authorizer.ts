import { APIGatewayRequestAuthorizerHandler } from 'aws-lambda';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export const handler: APIGatewayRequestAuthorizerHandler = async (event) => {
  try {
    console.log('Authorizer event:', JSON.stringify(event));
    
    const authHeader = event.headers?.Authorization || event.headers?.authorization;
    
    if (!authHeader) {
      throw new Error('No authorization header provided');
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    return {
      principalId: decoded.userId,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: event.methodArn
          }
        ]
      },
      context: {
        userId: decoded.userId,
        email: decoded.email
      }
    };
  } catch (error) {
    console.error('Authorization error:', error);
    throw new Error('Unauthorized');
  }
};