import { useState } from 'react';
import pushNotificationService from '../services/pushNotifications';

export default function NotificationTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const sendTestNotification = async () => {
    setIsLoading(true);
    setMessage('');
    setError('');
    
    try {
      // Check browser support
      if (!('Notification' in window)) {
        setError('Notifications not supported in this browser');
        setIsLoading(false);
        return;
      }

      // Check permission status
      const permission = Notification.permission;
      setMessage(`Permission status: ${permission}`);

      // Request permission if needed
      if (permission === 'default') {
        const newPermission = await Notification.requestPermission();
        if (newPermission !== 'granted') {
          setError('Notification permission denied');
          setIsLoading(false);
          return;
        }
      } else if (permission === 'denied') {
        setError('Notifications blocked. Please enable in browser settings.');
        setIsLoading(false);
        return;
      }

      // Check service worker
      if (!('serviceWorker' in navigator)) {
        setError('Service Workers not supported');
        setIsLoading(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      
      // Send notification with a delay to ensure it shows even if browser is focused
      setTimeout(async () => {
        try {
          await registration.showNotification('🎉 Test Notification', {
            body: 'Your notifications are working! This should appear even if the browser is open.',
            icon: '/pwa-192x192.png',
            badge: '/pwa-192x192.png',
            tag: 'test-notification',
            requireInteraction: false, // Don't require interaction for test
            actions: [
              { action: 'complete', title: '✅ Complete' },
              { action: 'snooze', title: '⏰ Snooze' }
            ],
            data: {
              type: 'test',
              timestamp: Date.now()
            }
          });
          
          setMessage('✅ Notification sent! It should appear in your notification center.');
          setError('');
        } catch (err: any) {
          setError(`Failed to show notification: ${err.message || err}`);
        }
      }, 1000); // 1 second delay

    } catch (error: any) {
      console.error('Notification test failed:', error);
      setError(`Error: ${error.message || error.toString()}`);
    } finally {
      setTimeout(() => setIsLoading(false), 1500);
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
        <div className="p-3 rounded-lg text-sm bg-blue-50 text-blue-700">
          {message}
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg text-sm bg-red-50 text-red-700">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="text-xs text-gray-500 space-y-1">
        <p>• Notifications must be enabled in your browser</p>
        <p>• iOS users: Add app to home screen first</p>
        <p>• Mac users: Check Notification Center if not visible</p>
        <p>• Test works even when app is in background</p>
      </div>

      {/* Debug Info */}
      <details className="mt-4">
        <summary className="text-xs text-gray-600 cursor-pointer">Debug Info</summary>
        <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600 space-y-1">
          <p>Browser: {navigator.userAgent.includes('iPhone') ? 'iOS' : navigator.userAgent.includes('Android') ? 'Android' : 'Desktop'}</p>
          <p>Notification Support: {('Notification' in window) ? 'Yes' : 'No'}</p>
          <p>Permission: {('Notification' in window) ? Notification.permission : 'N/A'}</p>
          <p>Service Worker: {('serviceWorker' in navigator) ? 'Supported' : 'Not Supported'}</p>
          <p>PWA Mode: {window.matchMedia('(display-mode: standalone)').matches ? 'Yes' : 'No'}</p>
        </div>
      </details>
    </div>
  );
}