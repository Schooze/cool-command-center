// File: src/services/authService.ts (Fixed URL Configuration)

import axios from 'axios';
import Cookies from 'js-cookie';
import { LoginResponse, User, IPStatus } from '@/types/auth.types';

// 🎯 SOLUSI: Fix API Base URL - Prioritas Local Backend
const API_BASE_URL = (() => {
  // Development environment - gunakan local backend
  if (import.meta.env.DEV || window.location.hostname === '192.168.100.253') {
    return 'http://192.168.100.30:8001';
  }
  
  // Production environment - gunakan Cloudflare tunnel jika tersedia
  return import.meta.env.VITE_API_URL || 'http://192.168.100.30:8001';
})();

console.log('🔧 API Base URL:', API_BASE_URL);
console.log('🔧 Environment:', import.meta.env.DEV ? 'Development' : 'Production');
console.log('🔧 Current hostname:', window.location.hostname);

const authAPI = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Increased timeout
  withCredentials: true, // Enable credentials for CORS
});

// ============= ENHANCED REQUEST INTERCEPTOR =============
authAPI.interceptors.request.use((config) => {
  const token = Cookies.get('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Enhanced headers for debugging
  config.headers['X-Client-App'] = 'Koronka-IoT-Dashboard';
  config.headers['X-Client-Version'] = '1.0.0';
  config.headers['X-Request-ID'] = Date.now().toString();
  
  const browserInfo = getBrowserInfo();
  config.headers['X-Browser-Info'] = browserInfo;
  
  // Debug log
  console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, {
    baseURL: config.baseURL,
    headers: config.headers,
    withCredentials: config.withCredentials
  });
  
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

// ============= ENHANCED RESPONSE INTERCEPTOR =============
authAPI.interceptors.response.use(
  (response) => {
    console.log('✅ Response received:', response.status, response.config.url);
    return response;
  },
  (error) => {
    const errorDetails = {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      message: error.message,
      code: error.code,
      baseURL: error.config?.baseURL
    };
    
    console.error('❌ API Error:', errorDetails);
    
    // Enhanced error handling for different scenarios
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.log('🚨 CORS/Network Error detected!');
      console.log('🔍 Troubleshooting:');
      console.log('    1. Check if backend is running');
      console.log('    2. Check Cloudflare tunnel status');
      console.log('    3. Verify origin in CORS settings');
      console.log('    4. Try switching to local IP instead of tunnel');
      
      // Enhance error message
      const enhancedError = new Error(
        'Tidak dapat terhubung ke server. Pastikan backend berjalan dan CORS dikonfigurasi dengan benar.'
      );
      enhancedError.name = 'NetworkError';
      return Promise.reject(enhancedError);
    }
    
    if (error.response?.status === 404) {
      console.log('🚨 404 Error - Endpoint not found!');
      console.log('🔍 Current API Base URL:', error.config?.baseURL);
      console.log('🔍 Full URL:', `${error.config?.baseURL}${error.config?.url}`);
      
      const enhancedError = new Error(
        `Endpoint tidak ditemukan: ${error.config?.url}. Periksa konfigurasi server.`
      );
      enhancedError.name = 'EndpointNotFound';
      return Promise.reject(enhancedError);
    }
    
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

// ============= HEALTH CHECK FUNCTION =============
const healthCheck = async (): Promise<boolean> => {
  try {
    console.log('🏥 Performing health check...');
    const response = await axios.get(`${API_BASE_URL}/health`, { 
      timeout: 5000,
      withCredentials: true 
    });
    console.log('✅ Health check passed:', response.status);
    return true;
  } catch (error) {
    console.log('❌ Health check failed:', error);
    return false;
  }
};

// ============= CORS DEBUG FUNCTION =============
const corsDebug = async (): Promise<void> => {
  try {
    console.log('🔍 Performing CORS debug...');
    const response = await axios.get(`${API_BASE_URL}/cors-debug`, {
      timeout: 5000,
      withCredentials: true,
      headers: {
        'Origin': window.location.origin
      }
    });
    console.log('✅ CORS debug successful:', response.data);
  } catch (error) {
    console.log('❌ CORS debug failed:', error);
  }
};

// ============= AUTH SERVICE =============
export const authService = {
  // Test connection and CORS
  async testConnection(): Promise<{ health: boolean; cors: boolean }> {
    const health = await healthCheck();
    
    let cors = false;
    try {
      await corsDebug();
      cors = true;
    } catch (error) {
      cors = false;
    }
    
    return { health, cors };
  },

  async login(username: string, password: string): Promise<LoginResponse> {
    console.log('🔐 Attempting login...');
    
    // Pre-login connection test
    const connectionTest = await this.testConnection();
    console.log('🔍 Connection test result:', connectionTest);
    
    if (!connectionTest.health) {
      throw new Error('Backend server tidak dapat dijangkau. Periksa koneksi server.');
    }
    
    if (!connectionTest.cors) {
      console.warn('⚠️ CORS test failed, but attempting login anyway...');
    }
    
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    try {
      const response = await authAPI.post('/auth/login', formData);
      console.log('✅ Login successful!');
      return response.data;
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  },

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
      secure: false, // Set to true in production with HTTPS
      sameSite: 'lax'
    });
  },

  getToken(): string | undefined {
    return Cookies.get('auth_token');
  },

  removeToken(): void {
    Cookies.remove('auth_token');
  },

  // Get current API configuration
  getConfig(): { baseURL: string; environment: string } {
    return {
      baseURL: API_BASE_URL,
      environment: import.meta.env.DEV ? 'development' : 'production'
    };
  }
};