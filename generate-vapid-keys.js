const webpush = require('web-push');

// Generate VAPID keys
const vapidKeys = webpush.generateVAPIDKeys();

console.log('VAPID Keys Generated:');
console.log('====================');
console.log('');
console.log('Add these to your environment variables:');
console.log('');
console.log(`VAPID_PUBLIC_KEY="${vapidKeys.publicKey}"`);
console.log(`VAPID_PRIVATE_KEY="${vapidKeys.privateKey}"`);
console.log('');
console.log('Add the public key to your frontend:');
console.log(`const VAPID_PUBLIC_KEY = '${vapidKeys.publicKey}';`);
console.log('');
console.log('Keep the private key secure and never expose it in client-side code!');