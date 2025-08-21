// src/services/configService.ts - Service untuk handle configuration API calls

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
  private baseUrl = '/api/devices/config';

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
      
      const response = await fetch(`${this.baseUrl}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add auth headers if needed
          // 'Authorization': `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify(requestPayload)
      });
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: Failed to save configuration`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
      
      const result: ConfigSaveResponse = await response.json();
      console.log('ConfigService: Save result:', result);
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to save configuration');
      }
      
      return result;
      
    } catch (error) {
      console.error('ConfigService: Error saving configuration:', error);
      
      // Enhanced error handling
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const networkError = new Error('Network error: Cannot connect to backend service. Please check if the backend is running.');
        networkError.name = 'ConfigNetworkError';
        throw networkError;
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
      
      const response = await fetch(`${this.baseUrl}/load/${encodeURIComponent(deviceId)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add auth headers if needed
          // 'Authorization': `Bearer ${this.getAuthToken()}`,
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log('ConfigService: No configuration found for device:', deviceId);
          return null; // No config found, use defaults
        }
        
        let errorMessage = `HTTP ${response.status}: Failed to load configuration`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch (e) {
          errorMessage = response.statusText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
      
      const result: ConfigLoadResponse = await response.json();
      console.log('ConfigService: Load result:', result);
      
      if (result.success && result.parameters) {
        // Convert parameters to format expected by frontend (f01 -> F01)
        const configData: { [key: string]: number } = {};
        
        Object.keys(result.parameters).forEach(key => {
          const upperKey = key.toUpperCase();
          configData[upperKey] = result.parameters[key];
        });
        
        console.log('ConfigService: Loaded configuration:', configData);
        return configData;
      } else {
        console.log('ConfigService: No parameters found in response');
        return null;
      }
      
    } catch (error) {
      console.error('ConfigService: Error loading configuration:', error);
      
      // For load operations, don't throw errors - just return null to use defaults
      if (error instanceof TypeError && error.message.includes('fetch')) {
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

  // Uncomment and implement if authentication is needed
  // private getAuthToken(): string {
  //   return localStorage.getItem('auth_token') || '';
  // }
}

// Export singleton instance
export const configService = new ConfigService();