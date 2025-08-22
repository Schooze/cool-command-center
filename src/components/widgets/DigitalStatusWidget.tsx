// src/components/widgets/DigitalStatusWidget.tsx
// Digital I/O Status Widget dengan data asli dari InfluxDB

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

// Digital Status Widget - Real InfluxDB Data
const DigitalStatusWidget = ({ config, onRemove, onSettings, isDragging, dragHandleProps }) => {
  const [digitalData, setDigitalData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const digitalFields = [
    { field: 'compressor_OUT', label: 'Compressor', type: 'output' },
    { field: 'fan_OUT', label: 'Fan 1', type: 'output' },
    { field: 'defrost_OUT', label: 'Defrost Heater', type: 'output' },
    { field: 'light_OUT', label: 'Light', type: 'output' },
    { field: 'door_L', label: 'Door Switch', type: 'input' },
    { field: 'alarm_OUT', label: 'Alarm', type: 'output' }
  ];

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

        const response = await influxDataService.getDigitalIOData(config.chipId, '1h');

        if (response.success) {
          const latestValues = {};
          
          // Get latest value for each field
          for (const fieldDef of digitalFields) {
            const fieldData = response.data[fieldDef.field];
            if (fieldData && fieldData.length > 0) {
              latestValues[fieldDef.field] = fieldData[fieldData.length - 1].value;
            } else {
              latestValues[fieldDef.field] = 0; // Default to off/inactive
            }
          }
          
          setDigitalData(latestValues);
        } else {
          setError(response.message || 'No data available');
        }
      } catch (err) {
        console.error('Error fetching digital I/O data:', err);
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [config.chipId]);

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
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700 mb-3">Digital Inputs</div>
          {digitalFields.filter(f => f.type === 'input').map((fieldDef) => (
            <div key={fieldDef.field} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{fieldDef.label}</span>
              <div className={`w-3 h-3 rounded-full ${
                digitalData[fieldDef.field] ? 'bg-green-500' : 'bg-gray-300'
              }`} />
            </div>
          ))}
          
          <div className="text-sm font-medium text-gray-700 mb-3 mt-4">Digital Outputs</div>
          {digitalFields.filter(f => f.type === 'output').map((fieldDef) => (
            <div key={fieldDef.field} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{fieldDef.label}</span>
              <div className={`w-3 h-3 rounded-full ${
                digitalData[fieldDef.field] ? 'bg-blue-500' : 'bg-gray-300'
              }`} />
            </div>
          ))}
        </div>
      )}
    </BaseWidget>
  );
};

export default DigitalStatusWidget;