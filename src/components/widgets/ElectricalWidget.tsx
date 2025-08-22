// src/components/widgets/ElectricalWidget.tsx
// Electrical Monitoring Widget dengan data asli dari InfluxDB

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

// Electrical Widget - Real InfluxDB Data
const ElectricalWidget = ({ config, onRemove, onSettings, isDragging, dragHandleProps }) => {
  const [electricalData, setElectricalData] = useState({});
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

        const response = await influxDataService.getElectricalData(config.chipId, '1h');

        if (response.success) {
          const latestValues = {};
          
          // Get latest value for each electrical parameter
          const fields = ['Current', 'Voltage', 'Power', 'PF', 'Energy', 'Frequency'];
          for (const field of fields) {
            const fieldData = response.data[field];
            if (fieldData && fieldData.length > 0) {
              latestValues[field] = fieldData[fieldData.length - 1].value;
            } else {
              latestValues[field] = 0;
            }
          }
          
          setElectricalData(latestValues);
        } else {
          setError(response.message || 'No electrical data available');
        }
      } catch (err) {
        console.error('Error fetching electrical data:', err);
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 15000); // Update every 15 seconds

    return () => clearInterval(interval);
  }, [config.chipId]);

  const getStatus = (value, type) => {
    switch (type) {
      case 'Current':
        if (value < 1) return 'Low';
        if (value > 15) return 'High';
        return 'Normal';
      case 'Voltage':
        if (value < 200) return 'Low';
        if (value > 250) return 'High';
        return 'Normal';
      default:
        return 'Normal';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'High':
        return 'text-red-600';
      case 'Low':
        return 'text-yellow-600';
      default:
        return 'text-green-600';
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
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {electricalData.Current ? electricalData.Current.toFixed(1) : '0.0'}A
              </div>
              <div className="text-xs text-gray-600">Current</div>
              <div className={`text-xs ${getStatusColor(getStatus(electricalData.Current, 'Current'))}`}>
                {getStatus(electricalData.Current, 'Current')}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {electricalData.Voltage ? electricalData.Voltage.toFixed(1) : '0.0'}V
              </div>
              <div className="text-xs text-gray-600">Voltage</div>
              <div className={`text-xs ${getStatusColor(getStatus(electricalData.Voltage, 'Voltage'))}`}>
                {getStatus(electricalData.Voltage, 'Voltage')}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div className="text-center">
              <div className="text-sm font-medium text-gray-900">
                {electricalData.Power ? electricalData.Power.toFixed(0) : '0'}W
              </div>
              <div className="text-xs text-gray-600">Power</div>
            </div>
            
            <div className="text-center">
              <div className="text-sm font-medium text-gray-900">
                {electricalData.PF ? electricalData.PF.toFixed(2) : '0.00'}
              </div>
              <div className="text-xs text-gray-600">Power Factor</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div className="text-center">
              <div className="text-sm font-medium text-gray-900">
                {electricalData.Energy ? electricalData.Energy.toFixed(2) : '0.00'}kWh
              </div>
              <div className="text-xs text-gray-600">Energy</div>
            </div>
            
            <div className="text-center">
              <div className="text-sm font-medium text-gray-900">
                {electricalData.Frequency ? electricalData.Frequency.toFixed(1) : '0.0'}Hz
              </div>
              <div className="text-xs text-gray-600">Frequency</div>
            </div>
          </div>
        </div>
      )}
    </BaseWidget>
  );
};

export default ElectricalWidget;