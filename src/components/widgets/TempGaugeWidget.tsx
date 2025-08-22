// src/components/widgets/TempGaugeWidget.tsx
// Temperature Gauge Widget dengan data asli dari InfluxDB

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

// Temperature Gauge Widget - Real InfluxDB Data
const TempGaugeWidget = ({ config, onRemove, onSettings, isDragging, dragHandleProps }) => {
  const [currentTemp, setCurrentTemp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

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

        const response = await influxDataService.getLatestValue({
          chipId: config.chipId,
          field: config.config.sensorField,
          measurement: 'sensor_data'
        });

        if (response.success && response.value !== null) {
          setCurrentTemp(response.value);
          setLastUpdate(new Date(response.timestamp));
        } else {
          setError(response.message || 'No recent data');
        }
      } catch (err) {
        console.error('Error fetching latest temperature:', err);
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 15000); // Update every 15 seconds

    return () => clearInterval(interval);
  }, [config.chipId, config.config?.sensorField]);

  const getTemperatureStatus = (temp) => {
    if (temp > -10) return { status: 'high', color: '#ef4444', label: 'High' };
    if (temp < -25) return { status: 'low', color: '#3b82f6', label: 'Low' };
    return { status: 'normal', color: '#10b981', label: 'Normal' };
  };

  const tempStatus = currentTemp !== null ? getTemperatureStatus(currentTemp) : null;

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
        <div className="flex flex-col items-center justify-center h-48">
          <div className="relative">
            <svg width="120" height="120" className="transform -rotate-90">
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke={tempStatus?.color || '#e5e7eb'}
                strokeWidth="8"
                strokeDasharray="314"
                strokeDashoffset="157"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">
                {currentTemp !== null ? `${currentTemp.toFixed(1)}` : '--'}
              </span>
              <span className="text-sm text-gray-600">°C</span>
            </div>
          </div>
          
          {tempStatus && (
            <div className="mt-4 text-center">
              <div 
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: tempStatus.color }}
              >
                {tempStatus.label}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Range: -20°C to -10°C
              </div>
            </div>
          )}
          
          {lastUpdate && (
            <div className="text-xs text-gray-400 mt-2">
              Updated: {lastUpdate.toLocaleTimeString()}
            </div>
          )}
        </div>
      )}
    </BaseWidget>
  );
};

export default TempGaugeWidget;