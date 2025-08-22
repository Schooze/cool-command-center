// src/components/widgets/SystemOverviewWidget.tsx
// System Overview Widget dengan data agregasi dari multiple devices

import React, { useState, useEffect } from 'react';
import { Settings, X, Grip, AlertTriangle } from 'lucide-react';

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

// System Overview Widget - Real data aggregation
const SystemOverviewWidget = ({ config, onRemove, onSettings, isDragging, dragHandleProps }) => {
  const [systemData, setSystemData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // In real implementation, this would fetch from:
        // - Device status from deviceService
        // - Aggregated sensor data from InfluxDB
        // - Alarm counts from backend
        // For now, using mock data with realistic values
        
        const mockSystemData = {
          unitsOnline: 3,
          totalUnits: 3,
          avgTemperature: -18.2,
          activeAlarms: 2,
          systemHealth: 95
        };

        setSystemData(mockSystemData);
      } catch (err) {
        console.error('Error fetching system overview:', err);
        setError(err.message || 'Failed to fetch system data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

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
              <div className="text-2xl font-bold text-green-600">
                {systemData.unitsOnline || 0}
              </div>
              <div className="text-sm text-gray-600">Units Online</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {systemData.avgTemperature ? `${systemData.avgTemperature}°C` : '--'}
              </div>
              <div className="text-sm text-gray-600">Avg Temperature</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {systemData.activeAlarms || 0}
              </div>
              <div className="text-sm text-gray-600">Active Alarms</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {systemData.systemHealth || 0}%
              </div>
              <div className="text-sm text-gray-600">System Health</div>
            </div>
          </div>
        </div>
      )}
    </BaseWidget>
  );
};

export default SystemOverviewWidget;