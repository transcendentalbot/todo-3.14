// Import Workbox libraries
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

// Precaching and routing setup by Vite PWA plugin will be injected here
// The actual manifest will be injected by the build process

// Push notification event handler
self.addEventListener('push', function(event) {
  if (!event.data) {
    console.log('Push event but no data');
    return;
  }

  try {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || '/pwa-192x192.png',
      badge: data.badge || '/pwa-192x192.png',
      vibrate: [200, 100, 200],
      data: data.data || {},
      requireInteraction: data.requireInteraction || false,
      actions: data.actions || [],
      timestamp: data.timestamp || Date.now()
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  } catch (error) {
    console.error('Error processing push notification:', error);
  }
});

// Notification click event handler
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const action = event.action;
  const notification = event.notification;
  const data = notification.data || {};

  // Handle different actions
  if (action === 'complete') {
    // Quick complete action
    event.waitUntil(
      fetch('/api/tracking/quick-complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + data.token // Token should be passed in notification data
        },
        body: JSON.stringify({
          type: data.type,
          timestamp: Date.now()
        })
      })
    );
  } else if (action === 'snooze') {
    // Snooze for 10 minutes
    event.waitUntil(
      new Promise(resolve => {
        setTimeout(() => {
          self.registration.showNotification(notification.title + ' (Reminder)', {
            body: notification.body,
            icon: notification.icon,
            badge: notification.badge,
            data: notification.data,
            actions: notification.actions
          });
          resolve();
        }, 10 * 60 * 1000); // 10 minutes
      })
    );
  } else {
    // Default action - open the app
    const urlToOpen = data.url || '/';
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(function(clientList) {
          // Check if there's already a window/tab open
          for (let client of clientList) {
            if (client.url.includes(self.location.origin) && 'focus' in client) {
              client.navigate(urlToOpen);
              return client.focus();
            }
          }
          // If no window/tab is open, open a new one
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
});

// Background sync for offline actions
self.addEventListener('sync', function(event) {
  if (event.tag === 'sync-tracking-data') {
    event.waitUntil(syncTrackingData());
  }
});

async function syncTrackingData() {
  // This will be called when connectivity is restored
  // Implement syncing of queued tracking data
  const cache = await caches.open('offline-tracking');
  const requests = await cache.keys();
  
  for (const request of requests) {
    try {
      const response = await fetch(request);
      if (response.ok) {
        await cache.delete(request);
      }
    } catch (error) {
      console.error('Sync failed for:', request.url);
    }
  }
}

// Install event - called when service worker is first installed
self.addEventListener('install', function(event) {
  self.skipWaiting();
});

// Activate event - called when service worker is activated
self.addEventListener('activate', function(event) {
  event.waitUntil(clients.claim());
});