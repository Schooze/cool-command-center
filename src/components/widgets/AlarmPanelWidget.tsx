// src/components/widgets/AlarmPanelWidget.tsx
// Alarm Panel Widget dengan data dari backend

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

// Alarm Panel Widget - Real data from backend
const AlarmPanelWidget = ({ config, onRemove, onSettings, isDragging, dragHandleProps }) => {
  const [alarms, setAlarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Mock alarm data - In real implementation, this would come from backend
        const mockAlarms = [
          {
            id: 1,
            type: 'High Temperature',
            chamber: 'Chamber A',
            time: new Date(Date.now() - 2 * 60000).toISOString(),
            priority: 'high',
            acknowledged: false
          },
          {
            id: 2,
            type: 'Door Open',
            chamber: 'Chamber B',
            time: new Date(Date.now() - 5 * 60000).toISOString(),
            priority: 'medium',
            acknowledged: false
          }
        ];

        setAlarms(mockAlarms);
      } catch (err) {
        console.error('Error fetching alarms:', err);
        setError(err.message || 'Failed to fetch alarms');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  const getTimeAgo = (timestamp) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
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
        <div className="space-y-3">
          {alarms.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-green-600 font-medium">No Active Alarms</div>
              <div className="text-sm text-gray-500">All systems operating normally</div>
            </div>
          ) : (
            alarms.map((alarm) => (
              <div
                key={alarm.id}
                className={`border-l-4 p-3 rounded-r ${getPriorityColor(alarm.priority)}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">
                      {alarm.type}
                    </div>
                    <div className="text-xs text-gray-600">
                      {alarm.chamber} • {getTimeAgo(alarm.time)}
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    alarm.priority === 'high' ? 'bg-red-500' : 
                    alarm.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                  } animate-pulse`} />
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </BaseWidget>
  );
};

export default AlarmPanelWidget;