import { APIGatewayTokenAuthorizerHandler } from 'aws-lambda';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export const handler: APIGatewayTokenAuthorizerHandler = async (event) => {
  try {
    const token = event.authorizationToken.replace('Bearer ', '');
    
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