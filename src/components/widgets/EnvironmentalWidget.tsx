// components/widgets/EnvironmentalWidget.tsx
import React, { useState, useEffect } from 'react';
import { Settings, X, GripVertical } from 'lucide-react';

const EnvironmentalWidget = ({ config, onRemove, onSettings, isDragging, dragHandleProps }) => {
  const [envData, setEnvData] = useState([
    { id: 'humidity', name: 'Humidity', value: 65.2, unit: '%', min: 40, max: 80 },
    { id: 'pressure', name: 'Pressure', value: 1013.2, unit: 'hPa', min: 950, max: 1050 }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setEnvData(prev => prev.map(item => ({
        ...item,
        value: item.value + (Math.random() - 0.5) * 0.5
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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
      <div className="space-y-4">
        {envData.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 border rounded">
            <div>
              <div className="font-medium">{item.name}</div>
              <div className="text-xs text-gray-500">{item.min}-{item.max}{item.unit}</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">{item.value.toFixed(1)}{item.unit}</div>
              <div className="text-xs text-green-600">Normal</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnvironmentalWidget;