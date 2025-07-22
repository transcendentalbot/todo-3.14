# Testing Guide - Wellness Companion MVP Enhancements

## 🚀 Quick Start
**Production URL**: https://todo-3-14.vercel.app  
**Test Credentials**: 
- Email: `test@example.com`
- Password: `Test1234`

## 1. 🔐 Client-Side Encryption Testing

### Test Steps:
1. **Open Browser DevTools** (F12) → Network tab
2. **Log in** with test credentials
3. **Create a check-in**:
   - Go to Daily Check-in
   - Set mood: 8, energy: 7
   - Add a voice note: "Testing encryption"
4. **Inspect the network request**:
   - Find the POST request to `/tracking/checkin`
   - Look at the Request Payload
   - You should see: `{"timestamp": 123456789, "encryptedData": "U2FsdGVkX1..."}`
   - The actual data (mood, energy, note) should be encrypted

### Verify Encryption:
```javascript
// In browser console, check if encryption is active:
localStorage.getItem('encryption_salt') // Should return a salt value
```

### Test Data Retrieval:
1. Navigate away and come back to Dashboard
2. Check if your data loads correctly (proves decryption works)

## 2. 📱 Push Notifications Testing

### Initial Setup:
1. **First Login**: You'll see a notification permission prompt
2. Click "Enable Reminders"
3. Browser will ask for notification permission - click "Allow"

### Test Immediate Notification:
```javascript
// In browser console, test local notification:
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then(registration => {
    registration.showNotification('Test Notification', {
      body: 'This is a test from Wellness Companion',
      icon: '/pwa-192x192.png',
      actions: [
        { action: 'complete', title: 'Complete' },
        { action: 'snooze', title: 'Snooze' }
      ]
    });
  });
}
```

### Check Service Worker:
1. DevTools → Application → Service Workers
2. Should see `sw.js` registered and active
3. Check "Push" and "Notification" are enabled

### Test Push from Backend (requires backend access):
```bash
# If you have backend access, you can trigger a test notification:
curl -X POST https://lp3u3xe58k.execute-api.us-east-1.amazonaws.com/prod/notifications/send \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR_USER_ID",
    "title": "Test Push Notification",
    "body": "Testing push notifications!",
    "urgency": "normal"
  }'
```

## 3. ⏰ Scheduled Notifications Testing

### Schedule (UTC Time):
- **7 AM UTC**: Morning check-in
- **12 PM UTC**: Lunch reminder  
- **6 PM UTC**: Supplement reminder
- **9 PM UTC**: Evening reflection

### How to Test:
1. **Check your timezone** relative to UTC
2. **Wait for scheduled time** (or adjust system clock for testing)
3. **Ensure app is closed** - notifications work in background

### Verify Schedule is Active:
Check CloudWatch Events in AWS Console:
- Look for rules: `wellness-companion-prod-rule-1` through `rule-4`
- These should show as "Enabled"

## 4. 📲 SMS Backup Testing

### Setup:
1. During notification prompt, enter phone number (format: +1234567890)
2. SMS only triggers for high-priority alerts when push fails

### Test SMS Fallback:
1. **Disable notifications** in browser settings
2. **Trigger a supplement reminder** (marked as high priority)
3. Should receive SMS to provided phone number

## 5. 🔒 Security & Privacy Testing

### Verify No Plaintext Storage:
1. **Check DynamoDB** (if you have AWS access):
   - Items should have `encryptedData` field, not `data`
   - No readable user information

### Test Password-Derived Encryption:
1. **Log out** and log back in
2. Data should still be accessible (encryption key derived from password)
3. **Wrong password** = can't decrypt existing data

## 6. 📱 Mobile PWA Testing

### iOS (Safari):
1. Open https://todo-3-14.vercel.app in Safari
2. Tap Share button → "Add to Home Screen"
3. Open from home screen (required for notifications on iOS 16.4+)
4. Test all features in PWA mode

### Android (Chrome):
1. Open site in Chrome
2. Should see "Install app" prompt
3. Install and test notifications work

## 7. 🔄 Offline Testing

### Test Offline Functionality:
1. Load the app normally
2. DevTools → Network → Set to "Offline"
3. Try navigating - cached pages should work
4. Create tracking entries - should queue
5. Go back online - queued data should sync

## 8. 🐛 Common Issues & Solutions

### Notifications Not Working:
- **Check permissions**: chrome://settings/content/notifications
- **iOS**: Must add to home screen first
- **Service Worker**: Check if registered properly
- **HTTPS required**: Only works on https:// or localhost

### Encryption Issues:
- **Clear localStorage** if data seems corrupted
- **Check console** for decryption errors
- **Ensure same password** used for encryption/decryption

### SMS Not Receiving:
- **Phone format**: Must include country code (+1 for US)
- **AWS SNS**: Check if phone is in sandbox mode
- **Cost limits**: SMS only for high-priority alerts

## 9. 📊 Monitoring

### Check Logs (AWS CloudWatch):
```
/aws/lambda/wellness-companion-prod-scheduledNotificationTrigger
/aws/lambda/wellness-companion-prod-notificationHandler
```

### Metrics to Monitor:
- Push notification delivery rate
- Encryption/decryption performance
- SMS fallback frequency
- Scheduled job execution

## 10. 🧪 Quick Test Checklist

- [ ] Login works
- [ ] Encryption active (check network tab)
- [ ] Notification permission requested
- [ ] Service worker registered
- [ ] Can create encrypted check-in
- [ ] Can view historical data
- [ ] PWA installable
- [ ] Offline mode works
- [ ] Scheduled notifications set up (check AWS)
- [ ] SMS fallback configured (if phone provided)

## Need Help?

1. **Check browser console** for errors
2. **Service Worker logs**: DevTools → Application → Service Workers → View logs
3. **Network tab**: Check API responses
4. **AWS CloudWatch**: For backend logs

---

Remember: Push notifications require HTTPS and won't work in incognito mode!