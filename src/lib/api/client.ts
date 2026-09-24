import axios from 'axios';
import { clearSession } from '../auth';
import { parseError } from '@/utils/errorParser';
import { logger } from '@/utils/logger';

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
export const API_BASE_URL = 'https://api.leadbajaar.com/api'
// export const API_BASE_URL = 'http://localhost:8000/api'
// export const WHATSAPP_BASE_URL = 'http://localhost:3000/api'
export const WHATSAPP_BASE_URL = 'https://wp.leadbajaar.com/api'

// Export both httpClient and api
export const httpClient = {
  async get(url: string) {
    const response = await fetch(`${API_BASE_URL}${url}`)
    if (!response.ok) throw new Error('API Error')
    return response.json()
  },

  async post(url: string, data?: any) {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('API Error')
    return response.json()
  },

  async put(url: string, data?: any) {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('API Error')
    return response.json()
  },

  async delete(url: string) {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('API Error')
    return response.json()
  },
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor to include token in headers
api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('token') // or get from your auth system
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const parsedError = parseError(error);

    // Only log to console/logger if it's a server error or unexpected crash
    // 422 (Validation), 401 (Auth), and 402 (Payment) are handled by the UI
    if (!parsedError.status || parsedError.status >= 500) {
      const isNetworkError = error?.message === 'Network Error' || parsedError.message.includes('connect to server');
      logger.error("API Error", error, { hideConsole: true, silent: isNetworkError });
    }

    // Global session handling (401)
    if (parsedError.status === 401) {
      clearSession();
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        if (currentPath !== '/signin' && currentPath !== '/signup') {
          window.location.href = '/signin';
        }
      }
    }

    // Subscription Expired (402)
    if (parsedError.status === 402) {
      // The SubscriptionGuard will handle the UI overlay, 
      // but we can also trigger a toast or log here
      logger.warn("Subscription Expired", parsedError);
    }

    return Promise.reject(parsedError);
  }
);

export default api;
