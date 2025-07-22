import { api } from './api';

// VAPID public key from backend
const VAPID_PUBLIC_KEY = 'BP83nSNqLs_KnH2iFtIvJqAIMVMQtFFlTevsgz5o1nzZHhfozU9YGXwNkpSGnIB6e_4FEnXTX9x8jxS5YcI4lqA';

class PushNotificationService {
  private static instance: PushNotificationService;
  private registration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;

  private constructor() {}

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  /**
   * Initialize push notifications
   */
  async initialize(): Promise<boolean> {
    // Check if push notifications are supported
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications are not supported');
      return false;
    }

    try {
      // Wait for service worker to be ready
      this.registration = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      this.subscription = await this.registration.pushManager.getSubscription();
      
      return this.subscription !== null;
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      return false;
    }
  }

  /**
   * Request permission and subscribe to push notifications
   */
  async requestPermission(phone?: string): Promise<boolean> {
    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        console.log('Notification permission denied');
        return false;
      }

      if (!this.registration) {
        await this.initialize();
      }

      if (!this.registration) {
        throw new Error('Service worker not registered');
      }

      // Subscribe to push notifications
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      this.subscription = subscription;

      // Send subscription to backend
      await api.post('/notifications/subscribe', {
        subscription: subscription.toJSON(),
        phone
      });

      return true;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return false;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(): Promise<boolean> {
    try {
      if (!this.subscription) {
        return true;
      }

      await this.subscription.unsubscribe();
      this.subscription = null;

      // TODO: Notify backend about unsubscription
      
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  /**
   * Check if push notifications are enabled
   */
  isEnabled(): boolean {
    return Notification.permission === 'granted' && this.subscription !== null;
  }

  /**
   * Get notification permission status
   */
  getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }

  /**
   * Convert VAPID key from base64 to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Show a local notification (for testing)
   */
  async showLocalNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!this.registration || Notification.permission !== 'granted') {
      throw new Error('Notifications not available');
    }

    await this.registration.showNotification(title, {
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      ...options
    });
  }
}

export default PushNotificationService.getInstance();