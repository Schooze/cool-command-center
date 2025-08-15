// File: src/services/deviceService.ts (NEW)

import axios from 'axios';
import Cookies from 'js-cookie';

// 🎯 SOLUSI: Consistent API Base URL (sama dengan authService)
const API_BASE_URL = (() => {
  // Development environment - gunakan local backend
  if (import.meta.env.DEV || window.location.hostname === '192.168.100.253') {
    return 'http://192.168.100.30:8001';
  }
  
  // Production environment - gunakan Cloudflare tunnel jika tersedia
  return import.meta.env.VITE_API_URL || 'http://192.168.100.30:8001';
})();

console.log('🔧 Device Service API Base URL:', API_BASE_URL);

// Create axios instance for device API
const deviceAPI = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
});

// ============= REQUEST INTERCEPTOR =============
deviceAPI.interceptors.request.use((config) => {
  const token = Cookies.get('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  config.headers['Content-Type'] = 'application/json';
  config.headers['X-Client-App'] = 'Koronka-IoT-Dashboard';
  config.headers['X-Request-ID'] = Date.now().toString();
  
  console.log(`🚀 Device API: ${config.method?.toUpperCase()} ${config.url}`, {
    baseURL: config.baseURL,
    withCredentials: config.withCredentials
  });
  
  return config;
});

// ============= RESPONSE INTERCEPTOR =============
deviceAPI.interceptors.response.use(
  (response) => {
    console.log('✅ Device API Response:', response.status, response.config.url);
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
    
    console.error('❌ Device API Error:', errorDetails);
    
    // Handle CORS/Network errors
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.log('🚨 Device API: CORS/Network Error detected!');
      
      const enhancedError = new Error(
        'Tidak dapat terhubung ke device service. Periksa koneksi backend.'
      );
      enhancedError.name = 'DeviceNetworkError';
      return Promise.reject(enhancedError);
    }
    
    // Handle 404 errors
    if (error.response?.status === 404) {
      console.log('🚨 Device API: 404 Error - Endpoint not found!');
      console.log('🔍 Full URL:', `${error.config?.baseURL}${error.config?.url}`);
      
      const enhancedError = new Error(
        `Device endpoint tidak ditemukan: ${error.config?.url}`
      );
      enhancedError.name = 'DeviceEndpointNotFound';
      return Promise.reject(enhancedError);
    }
    
    // Handle auth errors
    if (error.response?.status === 401) {
      console.log('🔄 Device API: Unauthorized - token invalid');
      Cookies.remove('auth_token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// ============= TYPE DEFINITIONS =============
export interface Product {
  id: string;
  serial_number: string;
  name: string;
  product_type_name: string;
  status: 'online' | 'offline';
  installed_at: string;
  location_lat?: number;
  location_long?: number;
}

export interface DeviceRegistrationRequest {
  device_id: string;
}

export interface DeviceRegistrationResponse {
  success: boolean;
  message: string;
  product?: any;
}

// ============= DEVICE SERVICE =============
export const deviceService = {
  // Health check for device service
  async healthCheck(): Promise<boolean> {
    try {
      console.log('🏥 Device Service: Health check...');
      const response = await axios.get(`${API_BASE_URL}/health`, { 
        timeout: 5000,
        withCredentials: true 
      });
      console.log('✅ Device Service: Health check passed');
      return true;
    } catch (error) {
      console.log('❌ Device Service: Health check failed:', error);
      return false;
    }
  },

  // Get all products
  async getProducts(): Promise<Product[]> {
    try {
      console.log('📦 Fetching products...');
      
      // Pre-check connection
      const isHealthy = await this.healthCheck();
      if (!isHealthy) {
        throw new Error('Device service tidak dapat dijangkau');
      }
      
      const response = await deviceAPI.get('/api/devices/products');
      
      console.log('✅ Products fetched successfully:', response.data.length);
      
      // Remove duplicates based on ID
      const uniqueProducts = response.data.filter((product: Product, index: number, self: Product[]) => 
        index === self.findIndex(p => p.id === product.id)
      );
      
      return uniqueProducts;
    } catch (error: any) {
      console.error('❌ Error fetching products:', error);
      throw error;
    }
  },

  // Register new device
  async registerDevice(deviceId: string, skipInflux: boolean = false): Promise<DeviceRegistrationResponse> {
    try {
      console.log('📝 Registering device:', deviceId);
      
      const requestBody: DeviceRegistrationRequest = {
        device_id: deviceId.trim()
      };

      const url = skipInflux 
        ? '/api/devices/register?skip_influx=true' 
        : '/api/devices/register';

      const response = await deviceAPI.post(url, requestBody);
      
      console.log('✅ Device registered successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error registering device:', error);
      throw error;
    }
  },

  // Update product name
  async updateProductName(productId: string, newName: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('✏️ Updating product name:', productId, newName);
      
      const response = await deviceAPI.put(
        `/api/devices/products/${productId}/name?new_name=${encodeURIComponent(newName.trim())}`
      );
      
      console.log('✅ Product name updated successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error updating product name:', error);
      throw error;
    }
  },

  // Delete product
  async deleteProduct(productId: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🗑️ Deleting product:', productId);
      
      const response = await deviceAPI.delete(`/api/devices/products/${productId}`);
      
      console.log('✅ Product deleted successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error deleting product:', error);
      throw error;
    }
  },

  // Get product detail
  async getProductDetail(productId: string): Promise<Product> {
    try {
      console.log('🔍 Getting product detail:', productId);
      
      const response = await deviceAPI.get(`/api/devices/products/${productId}`);
      
      console.log('✅ Product detail fetched successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error getting product detail:', error);
      throw error;
    }
  },

  // Debug endpoint
  async getDebugInfo(): Promise<any> {
    try {
      console.log('🐛 Getting debug info...');
      
      const response = await deviceAPI.get('/api/devices/debug/products');
      
      console.log('✅ Debug info fetched successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error getting debug info:', error);
      throw error;
    }
  },

  // Get current configuration
  getConfig(): { baseURL: string; environment: string } {
    return {
      baseURL: API_BASE_URL,
      environment: import.meta.env.DEV ? 'development' : 'production'
    };
  }
};