import axios from 'axios';
import Cookies from 'js-cookie';
import { LoginResponse, User } from '@/types/auth.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://192.168.100.30:8001';

const authAPI = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor untuk menambah auth header
authAPI.interceptors.request.use((config) => {
  const token = Cookies.get('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor untuk handle unauthorized
authAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async login(username: string, password: string): Promise<LoginResponse> {
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
    await authAPI.post('/auth/logout');
  },

  setToken(token: string): void {
    Cookies.set('auth_token', token, {
      expires: 7, // 7 days
      secure: true,
      sameSite: 'strict'
    });
  },

  getToken(): string | undefined {
    return Cookies.get('auth_token');
  },

  removeToken(): void {
    Cookies.remove('auth_token');
  }
};