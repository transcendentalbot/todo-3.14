# Notification Troubleshooting Guide

## Common Issues & Solutions

### 1. Mac/Desktop: "Notification sent but I don't see it"

**Solutions:**
- Check your Mac's Notification Center (top-right corner)
- Go to System Preferences → Notifications → Chrome/Safari
- Make sure notifications are set to "Alerts" not "Banners"
- Try switching to another tab/app after clicking test - notifications often don't show when browser is in focus
- Check if Do Not Disturb is enabled

### 2. iPhone: "Check console for errors"

**Solutions:**
1. **Must use Safari** (not Chrome)
2. **Must add to home screen**:
   - Tap Share button in Safari
   - Scroll down and tap "Add to Home Screen"
   - Open the app from home screen icon
3. **iOS 16.4+ required** for PWA notifications

**To see the debug info:**
- Click "Debug Info" dropdown in the notification test section
- It will show if notifications are supported

### 3. Android: Notifications not working

**Solutions:**
1. Check notification permissions:
   - Settings → Apps → Chrome → Notifications
2. Make sure Do Not Disturb is off
3. Try installing as PWA when prompted

### 4. Testing Without Real Notifications

If notifications aren't working, you can still test other features:

**Test Encryption:**
1. Create a check-in
2. Open DevTools → Network tab
3. Look for requests to `/tracking/*`
4. The payload should show `encryptedData` not plain text

**Test Service Worker:**
1. DevTools → Application → Service Workers
2. Should see `sw.js` active
3. Try going offline and app should still work

## Quick Debug Checklist

1. **Permission Status**: Should show "granted" in debug info
2. **Service Worker**: Should show "Supported" 
3. **Browser Support**: Should show "Yes" for notifications
4. **PWA Mode**: Shows "Yes" if installed as app

## Alternative Testing

If notifications still don't work, the scheduled reminders will still trigger at:
- 7 AM UTC (3 AM EDT)
- 12 PM UTC (8 AM EDT)
- 6 PM UTC (2 PM EDT)
- 9 PM UTC (5 PM EDT)

You can also test the API directly:
```javascript
// In browser console:
fetch('/api/notifications/subscribe', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token'),
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    subscription: { endpoint: 'test', keys: { p256dh: 'test', auth: 'test' }},
    phone: '+1234567890' // Optional SMS backup
  })
}).then(r => r.json()).then(console.log)