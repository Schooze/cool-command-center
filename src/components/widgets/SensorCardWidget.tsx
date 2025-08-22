// src/components/widgets/SensorCardWidget.tsx
// Sensor Card Widget dengan data asli dari InfluxDB

import React, { useState, useEffect } from 'react';
import { Settings, X, Grip, TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
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

// Sensor Card Widget - Real InfluxDB Data
const SensorCardWidget = ({ config, onRemove, onSettings, isDragging, dragHandleProps }) => {
  const [sensorValue, setSensorValue] = useState(null);
  const [trend, setTrend] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!config.chipId || !config.config?.sensorField) {
        setError('Device or sensor not configured');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get current value
        const currentResponse = await influxDataService.getLatestValue({
          chipId: config.chipId,
          field: config.config.sensorField,
          measurement: 'sensor_data'
        });

        // Get recent data for trend
        const trendResponse = await influxDataService.getSensorData({
          chipId: config.chipId,
          field: config.config.sensorField,
          measurement: 'sensor_data',
          timeRange: '1h',
          limit: 10
        });

        if (currentResponse.success && currentResponse.value !== null) {
          setSensorValue({
            value: currentResponse.value,
            unit: currentResponse.unit,
            timestamp: currentResponse.timestamp
          });

          // Calculate trend
          if (trendResponse.success && trendResponse.data.length >= 2) {
            const values = trendResponse.data.map(d => d.value);
            const recent = values.slice(-3).reduce((a, b) => a + b, 0) / 3;
            const older = values.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
            const difference = recent - older;
            
            if (Math.abs(difference) < 0.1) {
              setTrend('stable');
            } else if (difference > 0) {
              setTrend('up');
            } else {
              setTrend('down');
            }
          }
        } else {
          setError(currentResponse.message || 'No recent data');
        }
      } catch (err) {
        console.error('Error fetching sensor data:', err);
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 20000); // Update every 20 seconds

    return () => clearInterval(interval);
  }, [config.chipId, config.config?.sensorField]);

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-blue-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-red-600';
      case 'down':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

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
        <div className="text-center">
          <div className={`text-4xl font-bold mb-2 ${getTrendColor()}`}>
            {sensorValue ? `${sensorValue.value.toFixed(1)}` : '--'}
            <span className="text-lg ml-1">{sensorValue?.unit || ''}</span>
          </div>
          
          <div className="flex items-center justify-center space-x-2 mb-3">
            {getTrendIcon()}
            <span className="text-sm text-gray-600 capitalize">
              {trend || 'stable'}
            </span>
          </div>
          
          <div className="text-xs text-gray-500">
            {config.device} - {config.sensor}
          </div>
          
          {sensorValue?.timestamp && (
            <div className="text-xs text-gray-400 mt-2">
              {new Date(sensorValue.timestamp).toLocaleString()}
            </div>
          )}
        </div>
      )}
    </BaseWidget>
  );
};

export default SensorCardWidget;