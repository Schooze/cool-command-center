// components/widgets/TempGaugeWidget.tsx
import React, { useState, useEffect } from 'react';
import { Settings, X, GripVertical } from 'lucide-react';

const TempGaugeWidget = ({ config, onRemove, onSettings, isDragging, dragHandleProps }) => {
  const [temperature, setTemperature] = useState(-18.5);

  useEffect(() => {
    const interval = setInterval(() => {
      setTemperature(prev => prev + (Math.random() - 0.5) * 0.2);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const percentage = Math.max(0, Math.min(100, (temperature + 30) / 40 * 100));
  
  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 h-full flex flex-col transition-all duration-200 ${
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
      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle cx="64" cy="64" r="50" stroke="#e5e7eb" strokeWidth="8" fill="none" />
            <circle
              cx="64" cy="64" r="50"
              stroke={temperature < -20 ? "#3b82f6" : temperature < -15 ? "#f59e0b" : "#ef4444"}
              strokeWidth="8" fill="none"
              strokeDasharray={`${percentage * 3.14} 314`}
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-gray-900">{temperature.toFixed(1)}</span>
            <span className="text-sm text-gray-500">°C</span>
          </div>
        </div>
      </div>
      <div className="text-center text-sm text-gray-600">{config.device}</div>
    </div>
  );
};

export default TempGaugeWidget;