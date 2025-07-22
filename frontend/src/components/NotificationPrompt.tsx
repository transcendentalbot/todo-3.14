import { useState } from 'react';
import pushNotificationService from '../services/pushNotifications';

interface NotificationPromptProps {
  onComplete: () => void;
}

export default function NotificationPrompt({ onComplete }: NotificationPromptProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [showPhoneInput, setShowPhoneInput] = useState(false);

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    try {
      const success = await pushNotificationService.requestPermission(phone || undefined);
      if (success) {
        onComplete();
      } else {
        // If web push fails, show phone input for SMS backup
        setShowPhoneInput(true);
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      setShowPhoneInput(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Stay on Track with Reminders
          </h2>
          <p className="text-gray-600">
            Get gentle reminders for your daily check-ins, supplements, and wellness activities.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">🌅</span>
            <div>
              <p className="font-medium">Morning Check-in</p>
              <p className="text-sm text-gray-600">Start your day with energy tracking</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-2xl">💊</span>
            <div>
              <p className="font-medium">Supplement Reminders</p>
              <p className="text-sm text-gray-600">Never forget your vitamins</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-2xl">🌙</span>
            <div>
              <p className="font-medium">Evening Reflection</p>
              <p className="text-sm text-gray-600">Journal your daily happiness</p>
            </div>
          </div>
        </div>

        {showPhoneInput && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Optional: Add your phone number for SMS backup when notifications can't reach you
            </p>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1234567890"
              className="input-field"
            />
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={handleEnableNotifications}
            disabled={isLoading}
            className="flex-1 btn-primary"
          >
            {isLoading ? 'Setting up...' : 'Enable Reminders'}
          </button>
          <button
            onClick={handleSkip}
            disabled={isLoading}
            className="flex-1 btn-secondary"
          >
            Maybe Later
          </button>
        </div>

        <p className="text-xs text-center text-gray-500">
          You can change this anytime in settings
        </p>
      </div>
    </div>
  );
}