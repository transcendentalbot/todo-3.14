import { useState } from 'react';
import pushNotificationService from '../services/pushNotifications';

export default function NotificationTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const sendTestNotification = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      // Check if notifications are enabled
      if (!pushNotificationService.isEnabled()) {
        const success = await pushNotificationService.requestPermission();
        if (!success) {
          setMessage('Please enable notifications first');
          setIsLoading(false);
          return;
        }
      }

      // Send a test notification
      await pushNotificationService.showLocalNotification(
        '🎉 Test Notification', 
        {
          body: 'Your notifications are working! Tap an action below.',
          badge: '/pwa-192x192.png',
          icon: '/pwa-192x192.png',
          vibrate: [200, 100, 200],
          requireInteraction: true,
          actions: [
            { action: 'complete', title: '✅ Complete' },
            { action: 'snooze', title: '⏰ Snooze 10min' }
          ],
          data: {
            type: 'test',
            timestamp: Date.now()
          }
        }
      );
      
      setMessage('Test notification sent! Check your notifications.');
    } catch (error) {
      console.error('Notification test failed:', error);
      setMessage('Failed to send notification. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const testScheduledNotifications = () => {
    const times = [
      { time: '7:00 AM UTC', type: 'Morning Check-in' },
      { time: '12:00 PM UTC', type: 'Lunch Reminder' },
      { time: '6:00 PM UTC', type: 'Supplement Reminder' },
      { time: '9:00 PM UTC', type: 'Evening Reflection' }
    ];

    const now = new Date();
    const utcHour = now.getUTCHours();
    const utcMinute = now.getUTCMinutes();
    const currentUTC = `${utcHour}:${utcMinute.toString().padStart(2, '0')} UTC`;

    alert(`Scheduled Notifications (UTC):\n\n${times.map(t => `${t.time} - ${t.type}`).join('\n')}\n\nCurrent UTC Time: ${currentUTC}\n\nNotifications will fire automatically at these times.`);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Notification Testing</h2>
      
      <div className="space-y-3">
        <button
          onClick={sendTestNotification}
          disabled={isLoading}
          className="w-full btn-primary py-3 text-base font-medium flex items-center justify-center space-x-2"
        >
          <span>🔔</span>
          <span>{isLoading ? 'Sending...' : 'Send Test Notification'}</span>
        </button>

        <button
          onClick={testScheduledNotifications}
          className="w-full btn-secondary py-3 text-base font-medium flex items-center justify-center space-x-2"
        >
          <span>⏰</span>
          <span>View Notification Schedule</span>
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.includes('Failed') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
        }`}>
          {message}
        </div>
      )}

      <div className="text-xs text-gray-500 space-y-1">
        <p>• Notifications must be enabled in your browser</p>
        <p>• iOS users: Add app to home screen first</p>
        <p>• Test works even when app is in background</p>
      </div>
    </div>
  );
}