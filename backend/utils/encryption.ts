export interface EncryptedRequest {
  timestamp?: number;
  encryptedData?: string;
}

export function isEncryptedRequest(body: any): body is EncryptedRequest {
  return 'encryptedData' in body;
}

export function handleEncryptedData(
  userId: string,
  type: string,
  body: EncryptedRequest,
  additionalFields?: Record<string, any>
) {
  const timestamp = body.timestamp 
    ? new Date(body.timestamp).toISOString() 
    : new Date().toISOString();
  
  return {
    userId,
    timestamp,
    type,
    encryptedData: body.encryptedData,
    ...additionalFields
  };
}