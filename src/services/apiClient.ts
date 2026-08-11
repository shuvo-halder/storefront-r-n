import axios from 'axios';

// API base path from env or default
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 
  (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : '') || 
  '/api/storefront/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

// Interceptor for auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auratech_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
