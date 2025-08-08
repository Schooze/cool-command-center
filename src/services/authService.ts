
import axios from 'axios';
import Cookies from 'js-cookie';
import { LoginResponse, User, IPStatus } from '@/types/auth.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://192.168.100.30:8001';

const authAPI = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor
authAPI.interceptors.request.use((config) => {
  const token = Cookies.get('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  config.headers['X-Client-App'] = 'Koronka-IoT-Dashboard';
  config.headers['X-Client-Version'] = '1.0.0';
  
  const browserInfo = getBrowserInfo();
  config.headers['X-Browser-Info'] = browserInfo;
  
  return config;
});

function getBrowserInfo(): string {
  const ua = navigator.userAgent;
  const platform = navigator.platform;
  const language = navigator.language;
  
  let browser = 'Unknown';
  let version = 'Unknown';
  
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
  
  let deviceType = 'Desktop';
  if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    deviceType = 'Mobile';
  } else if (/Tablet|iPad/i.test(ua)) {
    deviceType = 'Tablet';
  }
  
  return `${browser}/${version} (${platform}) ${deviceType} Lang:${language}`;
}

// Response interceptor - Fixed to not auto-redirect on login page
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
      const currentPath = window.location.pathname;
      
      // Only redirect if NOT already on login page
      if (currentPath !== '/login' && currentPath !== '/') {
        console.log('🔄 Unauthorized - redirecting to login');
        Cookies.remove('auth_token');
        window.location.href = '/login';
      } else {
        console.log('🔄 Login failed - removing invalid token');
        Cookies.remove('auth_token');
      }
    }
    
    return Promise.reject(error);
  }
);

export const authService = {
  async login(username: string, password: string): Promise<LoginResponse> {
    console.log('🔐 Attempting login...');
    
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await authAPI.post('/auth/login', formData);
    return response.data;
  },

  // 🆕 NEW: Check IP status
  async checkIPStatus(): Promise<IPStatus> {
    console.log('🔍 Checking IP status...');
    const response = await authAPI.get('/auth/ip-status');
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await authAPI.get('/auth/me');
    return response.data;
  },

  async logout(): Promise<void> {
    console.log('🚪 Logging out...');
    await authAPI.post('/auth/logout');
  },

  setToken(token: string): void {
    Cookies.set('auth_token', token, {
      expires: 7,
      secure: false,
      sameSite: 'lax'
    });
  },

  getToken(): string | undefined {
    return Cookies.get('auth_token');
  },

  removeToken(): void {
    Cookies.remove('auth_token');
  }
};