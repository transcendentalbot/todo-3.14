import { useState, useEffect } from 'react';
import { trackingAPI } from '../services/api';

interface TrackingItem {
  userId: string;
  timestamp: string;
  type: string;
  data?: any;
  encryptedData?: string;
}

export default function TrackingHistory() {
  const [history, setHistory] = useState<TrackingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const response = await trackingAPI.getHistory();
      setHistory(response.data || []);
    } catch (err: any) {
      console.error('Failed to load history:', err);
      setError('Failed to load history');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const renderData = (item: TrackingItem) => {
    // If data is decrypted, show it
    if (item.data) {
      return (
        <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
          {JSON.stringify(item.data, null, 2)}
        </pre>
      );
    }
    
    // If still encrypted, show encrypted indicator
    if (item.encryptedData) {
      return (
        <div className="text-xs text-gray-500">
          🔒 Encrypted (length: {item.encryptedData.length})
        </div>
      );
    }
    
    return <div className="text-xs text-gray-400">No data</div>;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900">Recent Activity (Last 7 Days)</h3>
        <button
          onClick={loadHistory}
          className="text-sm text-indigo-600 hover:text-indigo-700"
        >
          Refresh
        </button>
      </div>

      {isLoading && (
        <div className="text-center py-4 text-gray-500">Loading...</div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded text-sm">
          {error}
        </div>
      )}

      {!isLoading && !error && history.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No tracking data yet. Create some check-ins!
        </div>
      )}

      {!isLoading && history.length > 0 && (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {history.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-3">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-sm capitalize">
                  {item.type}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDate(item.timestamp)}
                </span>
              </div>
              {renderData(item)}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        Showing {history.length} items • Data is encrypted end-to-end
      </div>
    </div>
  );
}