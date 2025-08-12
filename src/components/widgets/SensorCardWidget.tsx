// components/widgets/SensorCardWidget.tsx
import React, { useState, useEffect } from 'react';
import { Settings, X, GripVertical } from 'lucide-react';

const SensorCardWidget = ({ config, onRemove, onSettings, isDragging, dragHandleProps }) => {
  const [sensorData, setSensorData] = useState({
    value: -18.2, status: 'normal', min: -20, max: -10
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setSensorData(prev => {
        const newValue = prev.value + (Math.random() - 0.5) * 0.3;
        const status = newValue > prev.max || newValue < prev.min ? 'alarm' : 
                      Math.abs(newValue - (prev.max + prev.min) / 2) > (prev.max - prev.min) * 0.3 ? 'warning' : 'normal';
        return { ...prev, value: newValue, status };
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const statusColors = {
    normal: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    alarm: 'bg-red-100 text-red-800'
  };
  
  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 h-full transition-all duration-200 ${
      isDragging ? 'shadow-lg ring-2 ring-blue-500 rotate-2 scale-105' : 'hover:shadow-md'
    }`}>
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded">
            <GripVertical className="w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <h3 className="font-medium text-gray-900">{config.title}</h3>
        </div>
        <div className="flex gap-1">
          <button onClick={onSettings} className="p-1 hover:bg-gray-100 rounded">
            <Settings className="w-4 h-4 text-gray-500" />
          </button>
          <button onClick={onRemove} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
      <div className="flex items-center justify-center flex-1 flex-col space-y-3">
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-600">{sensorData.value.toFixed(1)}°C</div>
          <div className="text-sm text-gray-500 mt-1">{config.device} - {config.sensor}</div>
        </div>
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[sensorData.status]}`}>
          {sensorData.status.charAt(0).toUpperCase() + sensorData.status.slice(1)}
        </div>
        <div className="text-xs text-gray-500 text-center">Range: {sensorData.min}°C to {sensorData.max}°C</div>
      </div>
    </div>
  );
};

export default SensorCardWidget;