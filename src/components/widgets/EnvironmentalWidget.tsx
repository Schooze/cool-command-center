// src/components/widgets/EnvironmentalWidget.tsx
// Environmental Monitoring Widget dengan data asli dari InfluxDB

import React, { useState, useEffect } from 'react';
import { Settings, X, Grip, AlertTriangle } from 'lucide-react';
import { influxDataService } from '@/services/influxDataService';

// Base Widget Component
const BaseWidget = ({ title, onRemove, onSettings, isDragging, dragHandleProps, children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-sm border ${isDragging ? 'opacity-50' : ''} ${className}`}>
    <div className="flex items-center justify-between p-3 border-b bg-gray-50 rounded-t-lg">
      <div className="flex items-center space-x-2">
        <div {...dragHandleProps} className="cursor-move p-1 hover:bg-gray-200 rounded">
          <Grip className="w-4 h-4 text-gray-400" />
        </div>
        <h3 className="font-medium text-gray-900 text-sm">{title}</h3>
      </div>
      <div className="flex space-x-1">
        <button
          onClick={onSettings}
          className="p-1 hover:bg-gray-200 rounded"
          title="Settings"
        >
          <Settings className="w-4 h-4 text-gray-500" />
        </button>
        <button
          onClick={onRemove}
          className="p-1 hover:bg-red-100 rounded"
          title="Remove"
        >
          <X className="w-4 h-4 text-red-500" />
        </button>
      </div>
    </div>
    <div className="p-4">
      {children}
    </div>
  </div>
);

// Loading Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-32">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

// Error Component
const ErrorDisplay = ({ message }) => (
  <div className="flex items-center justify-center h-32">
    <div className="text-center">
      <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
      <p className="text-sm text-red-600">{message}</p>
    </div>
  </div>
);

// Environmental Widget - Real InfluxDB Data
const EnvironmentalWidget = ({ config, onRemove, onSettings, isDragging, dragHandleProps }) => {
  const [envData, setEnvData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!config.chipId) {
        setError('Device not configured');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await influxDataService.getEnvironmentalData(config.chipId, '1h');

        if (response.success) {
          const latestValues = {};
          
          // Get latest humidity value
          if (response.data.H && response.data.H.length > 0) {
            latestValues.humidity = response.data.H[response.data.H.length - 1].value;
          }
          
          // Get latest pressure value
          if (response.data.P && response.data.P.length > 0) {
            latestValues.pressure = response.data.P[response.data.P.length - 1].value;
          }
          
          setEnvData(latestValues);
        } else {
          setError(response.message || 'No environmental data available');
        }
      } catch (err) {
        console.error('Error fetching environmental data:', err);
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 20000); // Update every 20 seconds

    return () => clearInterval(interval);
  }, [config.chipId]);

  const getHumidityStatus = (humidity) => {
    if (humidity < 40) return { status: 'Low', color: 'text-yellow-600' };
    if (humidity > 80) return { status: 'High', color: 'text-red-600' };
    return { status: 'Normal', color: 'text-green-600' };
  };

  const getPressureStatus = (pressure) => {
    if (pressure < 950) return { status: 'Low', color: 'text-yellow-600' };
    if (pressure > 1050) return { status: 'High', color: 'text-red-600' };
    return { status: 'Normal', color: 'text-green-600' };
  };

  const humidityStatus = envData.humidity ? getHumidityStatus(envData.humidity) : null;
  const pressureStatus = envData.pressure ? getPressureStatus(envData.pressure) : null;

  return (
    <BaseWidget
      title={config.title}
      onRemove={onRemove}
      onSettings={onSettings}
      isDragging={isDragging}
      dragHandleProps={dragHandleProps}
    >
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorDisplay message={error} />
      ) : (
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {envData.humidity ? `${envData.humidity.toFixed(1)}%` : '--'}
            </div>
            <div className="text-sm text-gray-600 mb-2">Humidity</div>
            <div className="text-xs text-gray-500">40-80% Normal</div>
            {humidityStatus && (
              <div className={`text-xs font-medium ${humidityStatus.color}`}>
                {humidityStatus.status}
              </div>
            )}
          </div>
          
          <div className="text-center border-t pt-4">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {envData.pressure ? `${envData.pressure.toFixed(1)}hPa` : '--'}
            </div>
            <div className="text-sm text-gray-600 mb-2">Pressure</div>
            <div className="text-xs text-gray-500">950-1050hPa Normal</div>
            {pressureStatus && (
              <div className={`text-xs font-medium ${pressureStatus.color}`}>
                {pressureStatus.status}
              </div>
            )}
          </div>
        </div>
      )}
    </BaseWidget>
  );
};

export default EnvironmentalWidget;