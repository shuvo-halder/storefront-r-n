import axios from 'axios';

// API base path from NEXT_PUBLIC_API_URL or default
const API_BASE_URL = 
  process.env.NEXT_PUBLIC_API_URL || 
  'https://admin.vyzobd.com/api/storefront/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor for auth token
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('vyzobd_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});
