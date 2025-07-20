import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/dev'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for auth
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
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