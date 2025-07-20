const AWS = require('aws-sdk');

console.log('Testing AWS Connection...\n');

// Test AWS credentials
const sts = new AWS.STS();
sts.getCallerIdentity({}, (err, data) => {
  if (err) {
    console.error('❌ AWS Connection Failed:');
    console.error(err.message);
    console.error('\nPlease run: aws configure');
    console.error('And ensure your AWS credentials are set correctly.');
    process.exit(1);
  } else {
    console.log('✅ AWS Connection Successful!');
    console.log('Account:', data.Account);
    console.log('User ARN:', data.Arn);
    console.log('\nYou can now deploy with: npm run deploy');
  }
});