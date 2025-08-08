// File: src/services/authService.ts (enhanced with custom headers)

import axios from 'axios';
import Cookies from 'js-cookie';
import { LoginResponse, User } from '@/types/auth.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://192.168.100.30:8001';

const authAPI = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor untuk menambah auth header dan custom user agent
authAPI.interceptors.request.use((config) => {
  const token = Cookies.get('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // 🔧 ENHANCEMENT: Add custom headers untuk better tracking
  config.headers['X-Client-App'] = 'Koronka-IoT-Dashboard';
  config.headers['X-Client-Version'] = '1.0.0';
  
  // Browser akan otomatis mengirim User-Agent, tapi kita bisa enhance
  const browserInfo = getBrowserInfo();
  config.headers['X-Browser-Info'] = browserInfo;
  
  console.log('🚀 Request headers:', {
    'User-Agent': config.headers['User-Agent'] || navigator.userAgent,
    'X-Client-App': config.headers['X-Client-App'],
    'X-Browser-Info': browserInfo
  });
  
  return config;
});

// Helper function untuk detect browser info
function getBrowserInfo(): string {
  const ua = navigator.userAgent;
  const platform = navigator.platform;
  const language = navigator.language;
  
  let browser = 'Unknown';
  let version = 'Unknown';
  
  // Detect browser
  if (ua.includes('Chrome') && !ua.includes('Edge')) {
    browser = 'Chrome';
    version = ua.match(/Chrome\/([0-9.]+)/)?.[1] || 'Unknown';
  } else if (ua.includes('Firefox')) {
    browser = 'Firefox';
    version = ua.match(/Firefox\/([0-9.]+)/)?.[1] || 'Unknown';
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    browser = 'Safari';
    version = ua.match(/Safari\/([0-9.]+)/)?.[1] || 'Unknown';
  } else if (ua.includes('Edge')) {
    browser = 'Edge';
    version = ua.match(/Edge\/([0-9.]+)/)?.[1] || 'Unknown';
  }
  
  // Detect device type
  let deviceType = 'Desktop';
  if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    deviceType = 'Mobile';
  } else if (/Tablet|iPad/i.test(ua)) {
    deviceType = 'Tablet';
  }
  
  return `${browser}/${version} (${platform}) ${deviceType} Lang:${language}`;
}

// Response interceptor untuk handle unauthorized
authAPI.interceptors.response.use(
  (response) => {
    console.log('✅ Response received:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      Cookies.remove('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async login(username: string, password: string): Promise<LoginResponse> {
    console.log('🔐 Attempting login with enhanced headers...');
    
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await authAPI.post('/auth/login', formData);
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await authAPI.get('/auth/me');
    return response.data;
  },

  async logout(): Promise<void> {
    console.log('🚪 Logging out with user agent tracking...');
    await authAPI.post('/auth/logout');
  },

  setToken(token: string): void {
    Cookies.set('auth_token', token, {
      expires: 7, // 7 days
      secure: false, // Set false untuk development
      sameSite: 'lax' // Changed for development
    });
  },

  getToken(): string | undefined {
    return Cookies.get('auth_token');
  },

  removeToken(): void {
    Cookies.remove('auth_token');
  }
};