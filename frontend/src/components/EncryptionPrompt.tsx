import React, { useState } from 'react';
import encryptionService from '../services/encryption';

interface EncryptionPromptProps {
  onSuccess: () => void;
  onCancel?: () => void;
}

const EncryptionPrompt: React.FC<EncryptionPromptProps> = ({ onSuccess, onCancel }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const success = await encryptionService.reInitialize(password);
      
      if (success) {
        onSuccess();
      } else {
        setError('Unable to initialize encryption. Please log in again.');
      }
    } catch (error) {
      setError('Invalid password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Unlock Journal</h2>
        
        <p className="text-gray-600 mb-6">
          Your journal entries are encrypted. Please enter your password to access them.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter your password"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm mb-4">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg font-semibold disabled:opacity-50 hover:bg-purple-700 transition-colors"
            >
              {isLoading ? 'Unlocking...' : 'Unlock'}
            </button>
            
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="py-2 px-4 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-4 text-center">
            Or <a href="/login" className="text-purple-600 hover:underline">log in again</a> to reset encryption
          </p>
        </form>
      </div>
    </div>
  );
};

export default EncryptionPrompt;