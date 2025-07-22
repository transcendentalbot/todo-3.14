import axios from 'axios'
import encryptionService from './encryption'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/dev'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for auth and encryption
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Encrypt data for tracking endpoints
    if (config.url?.includes('/tracking/') && config.data && encryptionService.isInitialized()) {
      const timestamp = config.data.timestamp || Date.now()
      const encryptedData = encryptionService.encrypt(config.data)
      config.data = {
        timestamp,
        encryptedData
      }
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling and decryption
api.interceptors.response.use(
  (response) => {
    // Decrypt data from tracking endpoints
    if (response.config.url?.includes('/tracking/') && response.data?.encryptedData && encryptionService.isInitialized()) {
      try {
        response.data = encryptionService.decrypt(response.data.encryptedData)
      } catch (err) {
        console.error('Failed to decrypt response:', err)
      }
    }
    
    // Handle array of encrypted items (e.g., history)
    if (response.config.url?.includes('/tracking/history') && Array.isArray(response.data) && encryptionService.isInitialized()) {
      response.data = response.data.map(item => {
        if (item.encryptedData) {
          try {
            return {
              ...item,
              data: encryptionService.decrypt(item.encryptedData)
            }
          } catch (err) {
            console.error('Failed to decrypt item:', err)
            return item
          }
        }
        return item
      })
    }
    
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      encryptionService.clear()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API methods
export const authAPI = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  
  register: (email: string, password: string) => 
    api.post('/auth/register', { email, password }),
  
  getProfile: () => 
    api.get('/user/profile'),
}

export const trackingAPI = {
  checkin: (data: any) => 
    api.post('/tracking/checkin', data),
  
  uploadPhoto: (photoType: 'selfie' | 'food', base64Image: string, mimeType: string, note?: string) => 
    api.post('/tracking/photo', { photoType, base64Image, mimeType, note }),
  
  logWeight: (weight: number, unit: 'lbs' | 'kg', note?: string) => 
    api.post('/tracking/weight', { weight, unit, note }),
  
  logSupplement: (taken: boolean, supplements?: string[], note?: string) => 
    api.post('/tracking/supplement', { taken, supplements, note }),
  
  getHistory: (startDate?: string, endDate?: string) => 
    api.get('/tracking/history', { params: { startDate, endDate } }),
}