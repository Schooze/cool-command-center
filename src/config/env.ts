// src/config/env.ts
// Environment configuration untuk Vite

export const ENV_CONFIG = {
  // API Base URL
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  
  // Environment info
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
  MODE: import.meta.env.MODE,
  
  // InfluxDB specific settings (jika diperlukan di frontend)
  INFLUX_UPDATE_INTERVAL: parseInt(import.meta.env.VITE_INFLUX_UPDATE_INTERVAL || '15000'),
  
  // Feature flags
  ENABLE_DEBUG_LOGS: import.meta.env.VITE_ENABLE_DEBUG_LOGS === 'true',
  ENABLE_MOCK_DATA: import.meta.env.VITE_ENABLE_MOCK_DATA === 'true',
};

// Validate environment configuration
export const validateEnvConfig = () => {
  const issues: string[] = [];
  
  if (!ENV_CONFIG.API_URL.startsWith('http')) {
    issues.push('VITE_API_URL must be a valid HTTP/HTTPS URL');
  }
  
  if (ENV_CONFIG.INFLUX_UPDATE_INTERVAL < 1000) {
    issues.push('VITE_INFLUX_UPDATE_INTERVAL must be at least 1000ms');
  }
  
  if (issues.length > 0) {
    console.warn('⚠️ Environment configuration issues:', issues);
  }
  
  return issues.length === 0;
};

// Initialize and validate config
validateEnvConfig();

// Log configuration in development
if (ENV_CONFIG.IS_DEV) {
  console.log('🔧 Environment Configuration:', {
    API_URL: ENV_CONFIG.API_URL,
    MODE: ENV_CONFIG.MODE,
    IS_DEV: ENV_CONFIG.IS_DEV,
    INFLUX_UPDATE_INTERVAL: ENV_CONFIG.INFLUX_UPDATE_INTERVAL,
    ENABLE_DEBUG_LOGS: ENV_CONFIG.ENABLE_DEBUG_LOGS,
    ENABLE_MOCK_DATA: ENV_CONFIG.ENABLE_MOCK_DATA,
  });
}