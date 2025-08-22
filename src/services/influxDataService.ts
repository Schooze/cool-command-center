// src/services/influxDataService.ts
// Service untuk mengambil data sensor dari InfluxDB untuk widget dashboard

import axios from 'axios';
import { ENV_CONFIG } from '@/config/env';

interface SensorDataRequest {
  chipId: string;
  field: string;
  measurement: string;
  timeRange?: string;
  limit?: number;
}

interface SensorDataPoint {
  time: string;
  value: number;
  field: string;
}

interface SensorDataResponse {
  success: boolean;
  data: SensorDataPoint[];
  chipId: string;
  field: string;
  message?: string;
}

interface LatestValueRequest {
  chipId: string;
  field: string;
  measurement: string;
}

interface LatestValueResponse {
  success: boolean;
  value: number | null;
  timestamp: string | null;
  chipId: string;
  field: string;
  unit?: string;
  message?: string;
}

interface MultiSensorRequest {
  chipId: string;
  fields: string[];
  measurement: string;
  timeRange?: string;
}

interface MultiSensorResponse {
  success: boolean;
  data: {
    [field: string]: SensorDataPoint[];
  };
  chipId: string;
  message?: string;
}

class InfluxDataService {
  private baseURL: string;
  private timeout: number;

  constructor() {
    // FIXED: Menggunakan centralized environment configuration
    this.baseURL = ENV_CONFIG.API_URL;
    this.timeout = 10000; // 10 seconds
    
    if (ENV_CONFIG.IS_DEV) {
      console.log('🔧 InfluxDataService initialized:', {
        baseURL: this.baseURL,
        timeout: this.timeout,
        updateInterval: ENV_CONFIG.INFLUX_UPDATE_INTERVAL
      });
    }
  }

  /**
   * Mendapatkan data sensor untuk rentang waktu tertentu
   * Digunakan untuk chart/graph widget
   */
  async getSensorData(request: SensorDataRequest): Promise<SensorDataResponse> {
    try {
      if (ENV_CONFIG.ENABLE_DEBUG_LOGS) {
        console.log('InfluxDataService: Fetching sensor data:', request);
      }

      const response = await axios.post<SensorDataResponse>(
        `${this.baseURL}/api/influx/sensor-data`,
        {
          chipId: request.chipId,
          field: request.field,
          measurement: request.measurement || 'sensor_data',
          timeRange: request.timeRange || '1h',
          limit: request.limit || 100
        },
        {
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (ENV_CONFIG.ENABLE_DEBUG_LOGS) {
        console.log('InfluxDataService: Sensor data response:', response.data);
      }
      return response.data;

    } catch (error: any) {
      console.error('InfluxDataService: Error fetching sensor data:', error);
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout - InfluxDB service might be slow');
      }
      
      if (error.response?.status === 404) {
        throw new Error(`Device ${request.chipId} not found in InfluxDB`);
      }
      
      if (error.response?.status === 500) {
        throw new Error('InfluxDB service error - check backend logs');
      }

      throw new Error(error.response?.data?.message || 'Failed to fetch sensor data');
    }
  }

  /**
   * Mendapatkan nilai terbaru dari sensor
   * Digunakan untuk gauge, sensor card widget
   */
  async getLatestValue(request: LatestValueRequest): Promise<LatestValueResponse> {
    try {
      if (ENV_CONFIG.ENABLE_DEBUG_LOGS) {
        console.log('InfluxDataService: Fetching latest value:', request);
      }

      const response = await axios.post<LatestValueResponse>(
        `${this.baseURL}/api/influx/latest-value`,
        {
          chipId: request.chipId,
          field: request.field,
          measurement: request.measurement || 'sensor_data'
        },
        {
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (ENV_CONFIG.ENABLE_DEBUG_LOGS) {
        console.log('InfluxDataService: Latest value response:', response.data);
      }
      return response.data;

    } catch (error: any) {
      console.error('InfluxDataService: Error fetching latest value:', error);
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout - InfluxDB service might be slow');
      }
      
      if (error.response?.status === 404) {
        return {
          success: false,
          value: null,
          timestamp: null,
          chipId: request.chipId,
          field: request.field,
          message: `No data found for device ${request.chipId}`
        };
      }

      throw new Error(error.response?.data?.message || 'Failed to fetch latest value');
    }
  }

  /**
   * Mendapatkan multiple sensor data sekaligus
   * Digunakan untuk electrical, environmental, digital I/O widget
   */
  async getMultiSensorData(request: MultiSensorRequest): Promise<MultiSensorResponse> {
    try {
      if (ENV_CONFIG.ENABLE_DEBUG_LOGS) {
        console.log('InfluxDataService: Fetching multi-sensor data:', request);
      }

      const response = await axios.post<MultiSensorResponse>(
        `${this.baseURL}/api/influx/multi-sensor-data`,
        {
          chipId: request.chipId,
          fields: request.fields,
          measurement: request.measurement || 'sensor_data',
          timeRange: request.timeRange || '1h'
        },
        {
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (ENV_CONFIG.ENABLE_DEBUG_LOGS) {
        console.log('InfluxDataService: Multi-sensor data response:', response.data);
      }
      return response.data;

    } catch (error: any) {
      console.error('InfluxDataService: Error fetching multi-sensor data:', error);
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout - InfluxDB service might be slow');
      }

      throw new Error(error.response?.data?.message || 'Failed to fetch multi-sensor data');
    }
  }

  /**
   * Mendapatkan data temperature sensors (P1_T, P2_T, E_T, A_T, C_T)
   * Helper method untuk temperature-related widgets
   */
  async getTemperatureData(chipId: string, timeRange: string = '1h'): Promise<MultiSensorResponse> {
    return this.getMultiSensorData({
      chipId,
      fields: ['P1_T', 'P2_T', 'E_T', 'A_T', 'C_T'],
      measurement: 'sensor_data',
      timeRange
    });
  }

  /**
   * Mendapatkan data electrical sensors (Current, Voltage, Power, etc.)
   * Helper method untuk electrical widget
   */
  async getElectricalData(chipId: string, timeRange: string = '1h'): Promise<MultiSensorResponse> {
    return this.getMultiSensorData({
      chipId,
      fields: ['Current', 'Voltage', 'Power', 'PF', 'Energy', 'Frequency'],
      measurement: 'sensor_data',
      timeRange
    });
  }

  /**
   * Mendapatkan data environmental sensors (Humidity, Pressure)
   * Helper method untuk environmental widget
   */
  async getEnvironmentalData(chipId: string, timeRange: string = '1h'): Promise<MultiSensorResponse> {
    return this.getMultiSensorData({
      chipId,
      fields: ['H', 'P'],
      measurement: 'sensor_data',
      timeRange
    });
  }

  /**
   * Mendapatkan data digital I/O (relay outputs, door switch)
   * Helper method untuk digital status widget
   */
  async getDigitalIOData(chipId: string, timeRange: string = '1h'): Promise<MultiSensorResponse> {
    return this.getMultiSensorData({
      chipId,
      fields: ['compressor_OUT', 'defrost_OUT', 'fan_OUT', 'light_OUT', 'door_L', 'alarm_OUT'],
      measurement: 'sensor_data',
      timeRange
    });
  }

  /**
   * Mendapatkan semua sensor data untuk system overview
   */
  async getAllSensorData(chipId: string, timeRange: string = '1h'): Promise<MultiSensorResponse> {
    return this.getMultiSensorData({
      chipId,
      fields: [
        // Temperature sensors
        'P1_T', 'P2_T', 'E_T', 'A_T', 'C_T',
        // Environmental
        'H', 'P',
        // Electrical
        'Current', 'Voltage', 'Power',
        // Digital I/O
        'compressor_OUT', 'defrost_OUT', 'fan_OUT', 'light_OUT', 'door_L'
      ],
      measurement: 'sensor_data',
      timeRange
    });
  }

  /**
   * Check device connectivity berdasarkan last data timestamp
   */
  async checkDeviceConnectivity(chipId: string): Promise<{
    isOnline: boolean;
    lastSeen: string | null;
    minutesOffline: number | null;
  }> {
    try {
      // Cek data terbaru dari device
      const response = await this.getLatestValue({
        chipId,
        field: 'P1_T', // Gunakan P1_T sebagai heartbeat sensor
        measurement: 'sensor_data'
      });

      if (response.success && response.timestamp) {
        const lastSeen = new Date(response.timestamp);
        const now = new Date();
        const minutesOffline = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60));
        
        return {
          isOnline: minutesOffline < 5, // Consider offline if no data for 5+ minutes
          lastSeen: response.timestamp,
          minutesOffline
        };
      }

      return {
        isOnline: false,
        lastSeen: null,
        minutesOffline: null
      };

    } catch (error) {
      console.error('Error checking device connectivity:', error);
      return {
        isOnline: false,
        lastSeen: null,
        minutesOffline: null
      };
    }
  }

  /**
   * Get temperature statistics for multiple devices
   */
  async getTemperatureStats(chipIds: string[]): Promise<{
    [chipId: string]: {
      avgTemp: number;
      minTemp: number;
      maxTemp: number;
      currentTemp: number;
    }
  }> {
    const stats: any = {};

    try {
      for (const chipId of chipIds) {
        const tempData = await this.getSensorData({
          chipId,
          field: 'P1_T',
          measurement: 'sensor_data',
          timeRange: '24h',
          limit: 1440 // One per minute for 24h
        });

        if (tempData.success && tempData.data.length > 0) {
          const values = tempData.data.map(d => d.value);
          stats[chipId] = {
            avgTemp: values.reduce((a, b) => a + b, 0) / values.length,
            minTemp: Math.min(...values),
            maxTemp: Math.max(...values),
            currentTemp: values[values.length - 1]
          };
        } else {
          stats[chipId] = {
            avgTemp: 0,
            minTemp: 0,
            maxTemp: 0,
            currentTemp: 0
          };
        }
      }

      return stats;
    } catch (error) {
      console.error('Error getting temperature stats:', error);
      return {};
    }
  }
}

// Export singleton instance
export const influxDataService = new InfluxDataService();
export default influxDataService;