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
    
    // Extract the API Gateway ARN components
    // Format: arn:aws:execute-api:region:account:api-id/stage/method/resource
    const arnParts = event.methodArn.split(':');
    const apiGatewayArnPrefix = arnParts.slice(0, 5).join(':');
    const resourceParts = arnParts[5].split('/');
    const apiId = resourceParts[0];
    const stage = resourceParts[1];
    
    // Allow all methods and resources for this API and stage
    const resource = `${apiGatewayArnPrefix}:${apiId}/${stage}/*/*`;
    
    console.log('Generating policy for resource:', resource);
    
    return {
      principalId: decoded.userId,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: resource
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
    
    // Return explicit deny with CORS headers
    return {
      principalId: 'unauthorized',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: event.methodArn
          }
        ]
      },
      context: {
        stringKey: 'unauthorized',
        numberKey: 401,
        booleanKey: false
      }
    };
  }
};