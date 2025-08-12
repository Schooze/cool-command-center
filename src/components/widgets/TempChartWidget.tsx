// components/widgets/TempChartWidget.tsx
import React, { useState, useEffect } from 'react';
import { Settings, X, GripVertical } from 'lucide-react';

const TempChartWidget = ({ config, onRemove, onSettings, isDragging, dragHandleProps }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const data = Array.from({ length: 24 }, (_, i) => {
      const baseTemp = -18;
      const fluctuation = Math.sin(i * Math.PI / 12) * 2;
      const randomVariation = (Math.random() - 0.5) * 1;
      return {
        time: `${i}:00`,
        value: baseTemp + fluctuation + randomVariation
      };
    });
    setChartData(data);

    const interval = setInterval(() => {
      setChartData(prev => {
        const newData = [...prev.slice(1)];
        const lastTemp = prev[prev.length - 1]?.value || -18;
        newData.push({
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          value: lastTemp + (Math.random() - 0.5) * 0.5
        });
        return newData;
      });
    }, 5000);

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
      <div className="h-48">
        <svg width="100%" height="100%" viewBox="0 0 400 180">
          <defs>
            <linearGradient id="tempGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
            </linearGradient>
          </defs>
          {[0, 45, 90, 135, 180].map(y => (
            <line key={y} x1="40" y1={y} x2="380" y2={y} stroke="#e5e7eb" strokeWidth="1"/>
          ))}
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            points={chartData.slice(-12).map((point, i) => {
              const x = 40 + (i * 28);
              const y = 90 - (point.value + 20) * 2;
              return `${x},${y}`;
            }).join(' ')}
          />
          <polygon
            fill="url(#tempGradient)"
            points={`40,180 ${chartData.slice(-12).map((point, i) => {
              const x = 40 + (i * 28);
              const y = 90 - (point.value + 20) * 2;
              return `${x},${y}`;
            }).join(' ')} 380,180`}
          />
          <text x="30" y="25" fontSize="10" fill="#6b7280" textAnchor="end">-10°C</text>
          <text x="30" y="70" fontSize="10" fill="#6b7280" textAnchor="end">-15°C</text>
          <text x="30" y="115" fontSize="10" fill="#6b7280" textAnchor="end">-20°C</text>
          <text x="30" y="160" fontSize="10" fill="#6b7280" textAnchor="end">-25°C</text>
        </svg>
      </div>
      <div className="mt-2 text-sm text-gray-600">
        {config.device} - Current: {chartData[chartData.length - 1]?.value.toFixed(1) || 'N/A'}°C
      </div>
    </div>
  );
};

export default TempChartWidget;