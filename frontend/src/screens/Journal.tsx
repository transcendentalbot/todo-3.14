import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VoiceInput from '../components/VoiceInput';
import EncryptionPrompt from '../components/EncryptionPrompt';
import { journalService, type JournalEntry } from '../services/journal';
import encryptionService from '../services/encryption';

const Journal: React.FC = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [newEntry, setNewEntry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEncryptionPrompt, setShowEncryptionPrompt] = useState(false);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      setIsLoading(true);
      const { entries } = await journalService.getEntries();
      setEntries(entries);
    } catch (error: any) {
      console.error('Failed to load journal entries:', error);
      // Check if encryption is not initialized
      if (error.message?.includes('Encryption not initialized') && !encryptionService.isInitialized()) {
        setShowEncryptionPrompt(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const saveEntry = async () => {
    if (!newEntry.trim()) return;

    try {
      setIsLoading(true);
      
      await journalService.createEntry({
        content: newEntry,
        metadata: {
          createdVia: 'web'
        }
      });

      setNewEntry('');
      setShowNewEntry(false);
      await loadEntries();
    } catch (error: any) {
      console.error('Failed to save journal entry:', error);
      if (error.message?.includes('Encryption not initialized') && !encryptionService.isInitialized()) {
        setShowEncryptionPrompt(true);
      } else {
        alert('Failed to save journal entry');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const searchEntries = async () => {
    if (!searchQuery.trim()) {
      loadEntries();
      return;
    }

    try {
      setIsLoading(true);
      const results = await journalService.searchEntries(searchQuery);
      setEntries(results);
    } catch (error) {
      console.error('Failed to search entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    }
  };

  const getPrompt = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return "How are you feeling this morning? What's on your mind?";
    } else if (hour < 17) {
      return "How's your day going? Any thoughts to capture?";
    } else {
      return "What made you happy today? Any challenges you faced?";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pb-20">
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-lg hover:bg-white/50 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Journal</h1>
          <button
            onClick={() => setShowNewEntry(true)}
            className="p-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyUp={(e) => e.key === 'Enter' && searchEntries()}
              placeholder="Search your journal entries..."
              className="w-full pl-10 pr-4 py-3 bg-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <svg 
              className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  loadEntries();
                }}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* New Entry Form */}
        {showNewEntry && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <p className="text-gray-600 mb-4">{getPrompt()}</p>
            
            <textarea
              value={newEntry}
              onChange={(e) => setNewEntry(e.target.value)}
              placeholder="Start writing or use voice input..."
              className="w-full p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={6}
            />

            <div className="mt-4">
              <VoiceInput
                value=""
                onChange={(text) => setNewEntry(prev => prev + ' ' + text)}
                placeholder="Tap to speak..."
              />
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={saveEntry}
                disabled={isLoading || !newEntry.trim()}
                className="flex-1 py-3 px-6 bg-purple-600 text-white rounded-lg font-semibold disabled:opacity-50 hover:bg-purple-700 transition-colors"
              >
                {isLoading ? 'Saving...' : 'Save Entry'}
              </button>
              <button
                onClick={() => {
                  setNewEntry('');
                  setShowNewEntry(false);
                }}
                className="py-3 px-6 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Journal Entries List */}
        <div className="space-y-4">
          {isLoading && entries.length === 0 ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p className="mt-2 text-gray-600">Loading entries...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-2xl shadow-lg">
              <p className="text-gray-600 mb-4">No journal entries yet</p>
              <button
                onClick={() => setShowNewEntry(true)}
                className="py-2 px-6 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Create Your First Entry
              </button>
            </div>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.entryId}
                onClick={() => setSelectedEntry(entry)}
                className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-sm font-semibold text-purple-600">
                    {formatDate(entry.createdAt)}
                  </h3>
                  {entry.metadata?.emotion && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                      {entry.metadata.emotion}
                    </span>
                  )}
                </div>
                <p className="text-gray-700 line-clamp-3">
                  {entry.content}
                </p>
                {entry.metadata?.wordCount && (
                  <p className="text-xs text-gray-500 mt-2">
                    {entry.metadata.wordCount} words
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Entry Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-purple-600">
                  {formatDate(selectedEntry.createdAt)}
                </h3>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <p className="text-gray-700 whitespace-pre-wrap">
                {selectedEntry.content}
              </p>

              {selectedEntry.metadata && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  {selectedEntry.metadata.emotion && (
                    <p className="text-sm text-gray-600">
                      Emotion: <span className="font-semibold">{selectedEntry.metadata.emotion}</span>
                      {selectedEntry.metadata.emotionIntensity && (
                        <span> (Intensity: {selectedEntry.metadata.emotionIntensity}/10)</span>
                      )}
                    </p>
                  )}
                  {selectedEntry.metadata.wordCount && (
                    <p className="text-sm text-gray-600 mt-1">
                      Word count: {selectedEntry.metadata.wordCount}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Encryption Prompt Modal */}
      {showEncryptionPrompt && (
        <EncryptionPrompt
          onSuccess={() => {
            setShowEncryptionPrompt(false);
            loadEntries();
          }}
          onCancel={() => {
            setShowEncryptionPrompt(false);
            navigate('/dashboard');
          }}
        />
      )}
    </div>
  );
};

export default Journal;