import { api } from './api';

export interface JournalEntry {
  entryId: string;
  content: string;
  metadata?: {
    emotion?: string;
    emotionIntensity?: number;
    mood?: number;
    wordCount?: number;
    createdVia?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateJournalEntryData {
  content: string;
  metadata?: {
    mood?: number;
    wordCount?: number;
    createdVia?: string;
  };
}

class JournalService {
  async createEntry(data: CreateJournalEntryData): Promise<{ entryId: string; createdAt: string }> {
    console.log('Creating journal entry:', { contentLength: data.content.length });
    
    const payload = {
      content: data.content,
      metadata: {
        ...data.metadata,
        wordCount: data.content.split(/\s+/).filter(word => word.length > 0).length,
        createdVia: data.metadata?.createdVia || 'web'
      }
    };
    console.log('Sending payload:', payload);

    try {
      const response = await api.post('/journal/entry', payload);
      console.log('Journal entry created:', response.data);

      // Process entry with AI in the background
      try {
        await api.post('/journal/process', {
          entryId: response.data.entryId,
          content: data.content
        });
      } catch (error) {
        // Don't fail if processing fails - it's optional
        console.error('Failed to process journal entry:', error);
      }

      return response.data;
    } catch (error: any) {
      console.error('Journal API error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      throw error;
    }
  }

  async getEntries(limit?: number, lastKey?: string): Promise<{
    entries: JournalEntry[];
    lastKey?: string;
  }> {
    const params: any = {};
    if (limit) params.limit = limit;
    if (lastKey) params.lastKey = lastKey;

    const response = await api.get('/journal/entries', { params });
    
    // Entries are already decrypted by the backend
    const entries = response.data.entries;

    return {
      entries,
      lastKey: response.data.lastKey
    };
  }

  async getEntry(entryId: string): Promise<JournalEntry> {
    const response = await api.get(`/journal/entry/${entryId}`);
    
    return response.data;
  }

  async updateEntry(entryId: string, content: string, metadata?: any): Promise<void> {
    await api.put(`/journal/entry/${entryId}`, {
      content,
      metadata: {
        ...metadata,
        wordCount: content.split(/\s+/).filter(word => word.length > 0).length,
        updatedVia: 'web'
      }
    });
  }

  async deleteEntry(entryId: string): Promise<void> {
    await api.delete(`/journal/entry/${entryId}`);
  }

  async searchEntries(query: string): Promise<JournalEntry[]> {
    try {
      const response = await api.post('/journal/search', {
        query,
        limit: 20,
        threshold: 0.6
      });
      
      return response.data.entries;
    } catch (error) {
      console.error('Search failed, falling back to local search:', error);
      
      // Fallback to client-side search
      const { entries } = await this.getEntries(100);
      const searchTerms = query.toLowerCase().split(/\s+/);
      
      return entries.filter(entry => {
        const content = entry.content.toLowerCase();
        return searchTerms.every(term => content.includes(term));
      });
    }
  }
}

export const journalService = new JournalService();