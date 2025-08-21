// src/services/authService.ts - Fixed Login Parameter Handling
import axios from 'axios';
import Cookies from 'js-cookie';
import { User, LoginResponse, IPStatus } from '@/types/auth.types';

const API_BASE_URL = 'https://ecoolapi.reinutechiot.com';

console.log('🔧 API Base URL:', API_BASE_URL);
console.log('🔧 Environment:', import.meta.env.DEV ? 'Development' : 'Production');
console.log('🔧 Current hostname:', window.location.hostname);

// Create axios instance
const authAPI = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
});

// Request interceptor
authAPI.interceptors.request.use((config) => {
  const token = Cookies.get('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, {
    baseURL: config.baseURL,
    headers: config.headers,
    withCredentials: config.withCredentials
  });
  
  return config;
});

// Enhanced Response interceptor dengan debugging
authAPI.interceptors.response.use(
  (response) => {
    console.log('✅ Response received:', response.status, response.config.url);
    
    // 🐛 DEBUG: Log response data untuk endpoint yang penting
    if (response.config.url?.includes('/auth/login') || response.config.url?.includes('/auth/me')) {
      console.log('🔍 AUTH RESPONSE DEBUG:');
      console.log('- URL:', response.config.url);
      console.log('- Status:', response.status);
      console.log('- Headers:', response.headers);
      console.log('- Raw Data:', response.data);
      console.log('- Data Type:', typeof response.data);
      console.log('- Data Keys:', Object.keys(response.data || {}));
      
      if (response.data?.user) {
        console.log('🔍 USER OBJECT DEBUG:');
        console.log('- User:', response.data.user);
        console.log('- User Keys:', Object.keys(response.data.user || {}));
        console.log('- Account Type:', response.data.user.account_type);
        console.log('- Account Type Type:', typeof response.data.user.account_type);
        console.log('- Account Type Length:', response.data.user.account_type?.length);
      }
    }
    
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      message: error.message,
      code: error.code,
      responseData: error.response?.data
    });
    
    return Promise.reject(error);
  }
);

export const authService = {
  // 🔧 FIX: Proper login method dengan parameter handling yang benar
  async login(username: string, password: string): Promise<LoginResponse> {
    console.log('🔐 Attempting login for:', username); // Fixed: log only username
    
    // Test connection first
    const connectionTest = await this.testConnection();
    if (!connectionTest.health) {
      throw new Error('Server tidak dapat dijangkau. Periksa koneksi server.');
    }
    
    // 🔧 FIX: Proper FormData creation
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    console.log('🔍 FormData created with:');
    console.log('- username:', username);
    console.log('- password:', '[HIDDEN]');
    
    try {
      const response = await authAPI.post('/auth/login', formData);
      
      console.log('✅ Login successful!');
      console.log('🔍 FULL RESPONSE ANALYSIS:');
      console.log('- Response object:', response);
      console.log('- Response.data:', JSON.stringify(response.data, null, 2));
      
      // Validate response structure
      if (!response.data) {
        console.error('❌ No response data received');
        throw new Error('Invalid response: No data received');
      }
      
      if (!response.data.access_token) {
        console.error('❌ No access_token in response');
        console.log('Available keys:', Object.keys(response.data));
        throw new Error('Invalid response: Missing access_token');
      }
      
      if (!response.data.user) {
        console.error('❌ No user object in response');
        console.log('Available keys:', Object.keys(response.data));
        throw new Error('Invalid response: Missing user object');
      }
      
      // Validate user object
      const user = response.data.user;
      console.log('🔍 USER VALIDATION:');
      console.log('- User object:', user);
      console.log('- Has id:', !!user.id);
      console.log('- Has username:', !!user.username);
      console.log('- Has account_type:', !!user.account_type);
      console.log('- account_type value:', user.account_type);
      console.log('- account_type type:', typeof user.account_type);
      
      if (!user.account_type) {
        console.error('❌ Missing account_type in user object');
        console.log('User keys:', Object.keys(user));
        
        // Try to recover by setting default or throw error
        console.warn('⚠️ Setting default account_type to "client" due to missing field');
        user.account_type = 'client';
      }
      
      // Normalize account_type
      const normalizedAccountType = user.account_type.toString().toLowerCase().trim();
      console.log('🔧 Normalized account_type:', normalizedAccountType);
      
      // Validate account_type value
      if (!['admin', 'teknisi', 'client'].includes(normalizedAccountType)) {
        console.error('❌ Invalid account_type value:', user.account_type);
        console.warn('⚠️ Setting account_type to "client" due to invalid value');
        user.account_type = 'client';
      } else {
        user.account_type = normalizedAccountType;
      }
      
      console.log('🎯 FINAL USER OBJECT:', user);
      
      return response.data as LoginResponse;
      
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      
      // Enhanced error handling
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      } else if (error.response?.status === 401) {
        throw new Error('Username atau password salah');
      } else if (error.response?.status >= 500) {
        throw new Error('Server sedang bermasalah. Coba lagi nanti.');
      }
      
      throw new Error(error.message || 'Login failed');
    }
  },

  // Enhanced getCurrentUser dengan debugging
  async getCurrentUser(): Promise<User> {
    console.log('🔍 Fetching current user...');
    
    const response = await authAPI.get('/auth/me');
    
    console.log('🔍 GET CURRENT USER RESPONSE:');
    console.log('- Data:', JSON.stringify(response.data, null, 2));
    
    const user = response.data;
    
    // Validate and normalize account_type
    if (!user.account_type) {
      console.error('❌ Missing account_type in getCurrentUser response');
      user.account_type = 'client'; // default fallback
    }
    
    const normalizedAccountType = user.account_type.toString().toLowerCase().trim();
    if (!['admin', 'teknisi', 'client'].includes(normalizedAccountType)) {
      console.error('❌ Invalid account_type in getCurrentUser:', user.account_type);
      user.account_type = 'client'; // default fallback
    } else {
      user.account_type = normalizedAccountType;
    }
    
    console.log('🎯 FINAL CURRENT USER:', user);
    
    return user;
  },

  async checkIPStatus(): Promise<IPStatus> {
    console.log('🔍 Checking IP status...');
    const response = await authAPI.get('/auth/ip-status');
    return response.data;
  },

  async logout(): Promise<void> {
    console.log('🚪 Logging out...');
    await authAPI.post('/auth/logout');
  },

  // Connection test method
  async testConnection(): Promise<{ health: boolean; cors: boolean }> {
    try {
      console.log('🏥 Performing health check...');
      const healthResponse = await authAPI.get('/health');
      console.log('✅ Health check passed:', healthResponse.status);
      
      // Test CORS
      try {
        console.log('🔍 Performing CORS debug...');
        await authAPI.get('/cors-debug', {
          headers: { 'Origin': window.location.origin }
        });
        console.log('✅ CORS test passed');
        return { health: true, cors: true };
      } catch (corsError) {
        console.log('❌ CORS debug failed:', corsError);
        return { health: true, cors: false };
      }
      
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return { health: false, cors: false };
    }
  },

  setToken(token: string): void {
    console.log('🔐 Setting auth token');
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
    console.log('🗑️ Removing auth token');
    Cookies.remove('auth_token');
  },

  getConfig(): { baseURL: string; environment: string } {
    return {
      baseURL: API_BASE_URL,
      environment: import.meta.env.DEV ? 'development' : 'production'
    };
  }
};