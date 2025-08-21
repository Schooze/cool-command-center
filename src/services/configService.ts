// src/services/configService.ts - FIXED VERSION

import axios from 'axios';
import Cookies from 'js-cookie';

// FIXED: Use same base URL as deviceService
const API_BASE_URL = 'https://ecoolapi.reinutechiot.com';

console.log('🔧 Config Service API Base URL:', API_BASE_URL);

// FIXED: Create axios instance like deviceService
const configAPI = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
});

// FIXED: Add request interceptor with authentication
configAPI.interceptors.request.use((config) => {
  const token = Cookies.get('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  config.headers['Content-Type'] = 'application/json';
  config.headers['X-Client-App'] = 'Koronka-IoT-Dashboard';
  config.headers['X-Request-ID'] = Date.now().toString();
  
  console.log(`🚀 Config API: ${config.method?.toUpperCase()} ${config.url}`, {
    baseURL: config.baseURL,
    withCredentials: config.withCredentials
  });
  
  return config;
});

// FIXED: Add response interceptor for error handling
configAPI.interceptors.response.use(
  (response) => {
    console.log('✅ Config API Response:', response.status, response.config.url);
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
    
    console.error('❌ Config API Error:', errorDetails);
    
    // Handle CORS/Network errors
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.log('🚨 Config API: CORS/Network Error detected!');
      
      const enhancedError = new Error(
        'Tidak dapat terhubung ke config service. Periksa koneksi backend.'
      );
      enhancedError.name = 'ConfigNetworkError';
      return Promise.reject(enhancedError);
    }
    
    // Handle 404 errors
    if (error.response?.status === 404) {
      console.log('🚨 Config API: 404 Error - Endpoint not found!');
      console.log('🔍 Full URL:', `${error.config?.baseURL}${error.config?.url}`);
      
      const enhancedError = new Error(
        `Config endpoint tidak ditemukan: ${error.config?.url}`
      );
      enhancedError.name = 'ConfigEndpointNotFound';
      return Promise.reject(enhancedError);
    }
    
    // Handle auth errors
    if (error.response?.status === 401) {
      console.log('🔄 Config API: Unauthorized - token invalid');
      Cookies.remove('auth_token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

interface ConfigSaveRequest {
  device_id: string;
  parameters: { [key: string]: number }; // f01: -18.0, f02: 2.0, etc.
}

interface ConfigSaveResponse {
  success: boolean;
  message: string;
  device_id: string;
  timestamp: string;
}

interface ConfigLoadResponse {
  success: boolean;
  device_id: string;
  parameters: { [key: string]: number };
  timestamp?: string;
}

class ConfigService {
  /**
   * Save device configuration to InfluxDB
   */
  async saveConfiguration(deviceId: string, parameters: { [key: string]: number }): Promise<ConfigSaveResponse> {
    try {
      console.log('ConfigService: Saving configuration:', { deviceId, parameters });
      
      const requestPayload: ConfigSaveRequest = {
        device_id: deviceId,
        parameters: parameters
      };
      
      // FIXED: Use axios instance instead of fetch
      const response = await configAPI.post('/api/devices/config/save', requestPayload);
      
      console.log('ConfigService: Save result:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to save configuration');
      }
      
      return response.data;
      
    } catch (error: any) {
      console.error('ConfigService: Error saving configuration:', error);
      
      // Enhanced error handling
      if (error.name === 'ConfigNetworkError' || error.name === 'ConfigEndpointNotFound') {
        throw error;
      }
      
      // Handle axios errors
      if (error.response) {
        const errorMessage = error.response.data?.detail || 
                           error.response.data?.message || 
                           `HTTP ${error.response.status}: Failed to save configuration`;
        throw new Error(errorMessage);
      }
      
      throw error;
    }
  }

  /**
   * Load device configuration from InfluxDB
   */
  async loadConfiguration(deviceId: string): Promise<{ [key: string]: number } | null> {
    try {
      console.log('ConfigService: Loading configuration for device:', deviceId);
      
      // FIXED: Use axios instance instead of fetch
      const response = await configAPI.get(`/api/devices/config/load/${encodeURIComponent(deviceId)}`);
      
      console.log('ConfigService: Load result:', response.data);
      
      if (response.data.success && response.data.parameters) {
        // Convert parameters to format expected by frontend (f01 -> F01)
        const configData: { [key: string]: number } = {};
        
        Object.keys(response.data.parameters).forEach(key => {
          const upperKey = key.toUpperCase();
          configData[upperKey] = response.data.parameters[key];
        });
        
        console.log('ConfigService: Loaded configuration:', configData);
        return configData;
      } else {
        console.log('ConfigService: No parameters found in response');
        return null;
      }
      
    } catch (error: any) {
      console.error('ConfigService: Error loading configuration:', error);
      
      // For 404 errors, return null (no config found)
      if (error.response?.status === 404) {
        console.log('ConfigService: No configuration found for device:', deviceId);
        return null;
      }
      
      // For load operations, don't throw errors - just return null to use defaults
      if (error.name === 'ConfigNetworkError') {
        console.warn('ConfigService: Network error loading config, will use defaults');
      }
      
      return null;
    }
  }

  /**
   * Validate configuration parameters
   */
  validateParameters(parameters: { [key: string]: number }): boolean {
    const validKeys = ['f01', 'f02', 'f03', 'f04', 'f05', 'f06', 'f07', 'f08', 'f09', 'f10', 'f11', 'f12'];
    
    // Check if at least one valid parameter exists
    const hasValidParams = Object.keys(parameters).some(key => 
      validKeys.includes(key.toLowerCase())
    );
    
    if (!hasValidParams) {
      console.error('ConfigService: No valid F01-F12 parameters found:', parameters);
      return false;
    }
    
    // Check if all values are numbers
    const allNumbers = Object.values(parameters).every(value => 
      typeof value === 'number' && !isNaN(value)
    );
    
    if (!allNumbers) {
      console.error('ConfigService: Some parameter values are not valid numbers:', parameters);
      return false;
    }
    
    return true;
  }

  /**
   * Convert frontend parameter format to backend format
   * F01 -> f01, F02 -> f02, etc.
   */
  convertToBackendFormat(frontendParams: Array<{code: string, value: number}>): { [key: string]: number } {
    const backendParams: { [key: string]: number } = {};
    
    frontendParams.forEach(param => {
      backendParams[param.code.toLowerCase()] = param.value;
    });
    
    return backendParams;
  }

  /**
   * Convert backend parameter format to frontend format
   * f01 -> F01, f02 -> F02, etc.
   */
  convertToFrontendFormat(backendParams: { [key: string]: number }, defaultParams: Array<{code: string, value: number, name: string, min: number, max: number, unit: string}>): Array<{code: string, value: number, name: string, min: number, max: number, unit: string}> {
    return defaultParams.map(param => {
      const backendValue = backendParams[param.code.toUpperCase()] || backendParams[param.code.toLowerCase()];
      
      if (backendValue !== undefined) {
        return { ...param, value: backendValue };
      }
      
      return param; // Use default value
    });
  }

  /**
   * Test configuration service connection
   */
  async testConnection(): Promise<{ health: boolean; cors: boolean }> {
    try {
      console.log('🏥 Testing config service connection...');
      const response = await configAPI.get('/api/devices/config/health');
      console.log('✅ Config service health check passed:', response.status);
      return { health: true, cors: true };
    } catch (error) {
      console.error('❌ Config service health check failed:', error);
      return { health: false, cors: false };
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): { baseURL: string; environment: string } {
    return {
      baseURL: API_BASE_URL,
      environment: import.meta.env.DEV ? 'development' : 'production'
    };
  }
}

// Export singleton instance
export const configService = new ConfigService();