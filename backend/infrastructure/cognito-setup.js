const AWS = require('aws-sdk');

const cognito = new AWS.CognitoIdentityServiceProvider({
  region: 'us-east-1'
});

async function createUserPool() {
  const poolName = 'wellness-companion-user-pool';
  
  try {
    // Check if pool already exists
    const listParams = {
      MaxResults: 60
    };
    const pools = await cognito.listUserPools(listParams).promise();
    const existingPool = pools.UserPools.find(pool => pool.Name === poolName);
    
    if (existingPool) {
      console.log('User pool already exists:', existingPool.Id);
      
      // Get app client
      const clients = await cognito.listUserPoolClients({
        UserPoolId: existingPool.Id,
        MaxResults: 60
      }).promise();
      
      if (clients.UserPoolClients.length > 0) {
        console.log('App client already exists:', clients.UserPoolClients[0].ClientId);
        return {
          userPoolId: existingPool.Id,
          clientId: clients.UserPoolClients[0].ClientId
        };
      }
    }
    
    // Create new user pool
    const createPoolParams = {
      PoolName: poolName,
      Policies: {
        PasswordPolicy: {
          MinimumLength: 8,
          RequireUppercase: true,
          RequireLowercase: true,
          RequireNumbers: true,
          RequireSymbols: false
        }
      },
      UsernameAttributes: ['email'],
      AutoVerifiedAttributes: ['email'],
      EmailConfiguration: {
        EmailSendingAccount: 'COGNITO_DEFAULT'
      },
      Schema: [
        {
          Name: 'email',
          AttributeDataType: 'String',
          Mutable: false,
          Required: true
        }
      ]
    };
    
    const poolResult = await cognito.createUserPool(createPoolParams).promise();
    console.log('Created user pool:', poolResult.UserPool.Id);
    
    // Create app client
    const clientParams = {
      UserPoolId: poolResult.UserPool.Id,
      ClientName: 'wellness-companion-app',
      GenerateSecret: false,
      ExplicitAuthFlows: [
        'ALLOW_USER_PASSWORD_AUTH',
        'ALLOW_REFRESH_TOKEN_AUTH'
      ]
    };
    
    const clientResult = await cognito.createUserPoolClient(clientParams).promise();
    console.log('Created app client:', clientResult.UserPoolClient.ClientId);
    
    return {
      userPoolId: poolResult.UserPool.Id,
      clientId: clientResult.UserPoolClient.ClientId
    };
    
  } catch (error) {
    console.error('Error creating Cognito resources:', error);
    throw error;
  }
}

// Run the setup
createUserPool()
  .then(result => {
    console.log('\n=== Cognito Setup Complete ===');
    console.log('User Pool ID:', result.userPoolId);
    console.log('Client ID:', result.clientId);
    console.log('\nAdd these to your GitHub Secrets:');
    console.log('COGNITO_USER_POOL_ID=' + result.userPoolId);
    console.log('COGNITO_CLIENT_ID=' + result.clientId);
  })
  .catch(err => {
    console.error('Setup failed:', err);
    process.exit(1);
  });