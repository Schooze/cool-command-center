import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Settings, Thermometer, Fan, Snowflake, AlertTriangle, Activity, BarChart3, Gauge, TrendingUp, Map, Clock, Wrench, Power, Zap, Droplets, GripVertical } from 'lucide-react';

// Mock data untuk simulasi berdasarkan dashboard yang ada
const mockDevices = [
  { id: '1', name: 'Chamber A', type: 'Blast Freezer', location: 'Zone A' },
  { id: '2', name: 'Chamber B', type: 'Storage Freezer', location: 'Zone B' },
  { id: '3', name: 'Chamber C', type: 'Meat Chiller', location: 'Zone C' }
];

const mockSensors = [
  'Temperature', 'Humidity', 'Pressure', 'Current', 'Voltage', 'Compressor Status', 'Fan Status', 'Door Status'
];

const widgetTypes = [
  { id: 'temp-chart', name: 'Temperature Chart', icon: BarChart3, description: 'Temperature trend chart' },
  { id: 'temp-gauge', name: 'Temperature Gauge', icon: Gauge, description: 'Real-time temperature gauge' },
  { id: 'sensor-card', name: 'Sensor Card', icon: Thermometer, description: 'Individual sensor display' },
  { id: 'digital-status', name: 'Digital I/O', icon: Power, description: 'Digital inputs/outputs status' },
  { id: 'electrical', name: 'Electrical', icon: Zap, description: 'Current and voltage monitoring' },
  { id: 'alarm-panel', name: 'Alarm Panel', icon: AlertTriangle, description: 'Active alarms display' },
  { id: 'system-overview', name: 'System Overview', icon: Activity, description: 'Overall system status' },
  { id: 'environmental', name: 'Environmental', icon: Droplets, description: 'Humidity and pressure' }
];

// Widget Components with drag and drop support
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

const DigitalStatusWidget = ({ config, onRemove, onSettings, isDragging, dragHandleProps }) => {
  const digitalInputs = [
    { id: 'di1', name: 'Door Switch', active: false },
    { id: 'di2', name: 'Emergency Stop', active: false },
    { id: 'di3', name: 'High Pressure', active: false }
  ];

  const digitalOutputs = [
    { id: 'do1', name: 'Compressor', active: true },
    { id: 'do2', name: 'Fan 1', active: true },
    { id: 'do3', name: 'Fan 2', active: false },
    { id: 'do4', name: 'Defrost Heater', active: false },
    { id: 'do5', name: 'Alarm', active: false }
  ];

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
        <div>
          <h4 className="font-medium mb-2 text-sm text-gray-700">Digital Inputs</h4>
          <div className="space-y-2">
            {digitalInputs.map((input) => (
              <div key={input.id} className="flex items-center justify-between p-2 rounded bg-gray-50">
                <span className="text-sm">{input.name}</span>
                <div className={`h-3 w-3 rounded-full ${input.active ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-medium mb-2 text-sm text-gray-700">Digital Outputs</h4>
          <div className="space-y-2">
            {digitalOutputs.map((output) => (
              <div key={output.id} className="flex items-center justify-between p-2 rounded bg-gray-50">
                <span className="text-sm">{output.name}</span>
                <div className={`h-3 w-3 rounded-full ${output.active ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ElectricalWidget = ({ config, onRemove, onSettings, isDragging, dragHandleProps }) => {
  const [electrical, setElectrical] = useState([
    { id: 'current', name: 'Current', value: 8.5, unit: 'A', min: 0, max: 15 },
    { id: 'voltage', name: 'Voltage', value: 230.2, unit: 'V', min: 200, max: 250 }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setElectrical(prev => prev.map(item => ({
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
        {electrical.map((item) => (
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

const AlarmPanelWidget = ({ config, onRemove, onSettings, isDragging, dragHandleProps }) => {
  const alarms = [
    { type: 'High Temperature', device: 'Chamber A', time: '2 min ago', severity: 'high' },
    { type: 'Door Open', device: 'Chamber B', time: '5 min ago', severity: 'medium' },
    { type: 'Maintenance Due', device: 'Chamber C', time: '1 hour ago', severity: 'low' }
  ];

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
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {alarms.map((alarm, i) => (
          <div key={i} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 border-l-4 border-l-red-500">
            <AlertTriangle className={`w-5 h-5 ${
              alarm.severity === 'high' ? 'text-red-500' : 
              alarm.severity === 'medium' ? 'text-orange-500' : 'text-yellow-500'
            }`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{alarm.type}</p>
              <p className="text-xs text-gray-500">{alarm.device} • {alarm.time}</p>
            </div>
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              alarm.severity === 'high' ? 'bg-red-100 text-red-800' :
              alarm.severity === 'medium' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {alarm.severity}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SystemOverviewWidget = ({ config, onRemove, onSettings, isDragging, dragHandleProps }) => {
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
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">3</div>
          <div className="text-sm text-gray-600">Units Online</div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">-18.2°C</div>
          <div className="text-sm text-gray-600">Avg Temperature</div>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">2</div>
          <div className="text-sm text-gray-600">Active Alarms</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">95%</div>
          <div className="text-sm text-gray-600">System Health</div>
        </div>
      </div>
    </div>
  );
};

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

// Drag and Drop Implementation - Simplified
const DraggableWidget = ({ widget, index, onRemove, onSettings, onReorder }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef(null);
  const startPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    startPos.current = { x: e.clientX, y: e.clientY };
    setDragOffset({ x: 0, y: 0 });
    
    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startPos.current.x;
      const deltaY = moveEvent.clientY - startPos.current.y;
      setDragOffset({ x: deltaX, y: deltaY });
    };
    
    const handleMouseUp = (upEvent) => {
      setIsDragging(false);
      setDragOffset({ x: 0, y: 0 });
      
      // Simple reorder logic
      const gridContainer = document.querySelector('.widget-grid');
      if (gridContainer) {
        const widgets = Array.from(gridContainer.children);
        const rect = gridContainer.getBoundingClientRect();
        const x = upEvent.clientX - rect.left;
        const y = upEvent.clientY - rect.top;
        
        let targetIndex = index;
        widgets.forEach((widgetEl, i) => {
          const widgetRect = widgetEl.getBoundingClientRect();
          if (x >= widgetRect.left - rect.left && 
              x <= widgetRect.right - rect.left && 
              y >= widgetRect.top - rect.top && 
              y <= widgetRect.bottom - rect.top) {
            targetIndex = i;
          }
        });
        
        if (targetIndex !== index) {
          onReorder(index, targetIndex);
        }
      }
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const dragHandleProps = {
    onMouseDown: handleMouseDown
  };

  const style = isDragging ? {
    transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
    zIndex: 1000,
    position: 'relative',
    pointerEvents: 'none'
  } : {};

  return (
    <div ref={dragRef} style={style} className="transition-transform duration-200">
      <WidgetRenderer
        widget={widget}
        onRemove={onRemove}
        onSettings={onSettings}
        isDragging={isDragging}
        dragHandleProps={dragHandleProps}
      />
    </div>
  );
};

const WidgetRenderer = ({ widget, onRemove, onSettings, isDragging, dragHandleProps }) => {
  switch (widget.type) {
    case 'temp-chart':
      return <TempChartWidget config={widget} onRemove={onRemove} onSettings={onSettings} isDragging={isDragging} dragHandleProps={dragHandleProps} />;
    case 'temp-gauge':
      return <TempGaugeWidget config={widget} onRemove={onRemove} onSettings={onSettings} isDragging={isDragging} dragHandleProps={dragHandleProps} />;
    case 'sensor-card':
      return <SensorCardWidget config={widget} onRemove={onRemove} onSettings={onSettings} isDragging={isDragging} dragHandleProps={dragHandleProps} />;
    case 'digital-status':
      return <DigitalStatusWidget config={widget} onRemove={onRemove} onSettings={onSettings} isDragging={isDragging} dragHandleProps={dragHandleProps} />;
    case 'electrical':
      return <ElectricalWidget config={widget} onRemove={onRemove} onSettings={onSettings} isDragging={isDragging} dragHandleProps={dragHandleProps} />;
    case 'alarm-panel':
      return <AlarmPanelWidget config={widget} onRemove={onRemove} onSettings={onSettings} isDragging={isDragging} dragHandleProps={dragHandleProps} />;
    case 'system-overview':
      return <SystemOverviewWidget config={widget} onRemove={onRemove} onSettings={onSettings} isDragging={isDragging} dragHandleProps={dragHandleProps} />;
    case 'environmental':
      return <EnvironmentalWidget config={widget} onRemove={onRemove} onSettings={onSettings} isDragging={isDragging} dragHandleProps={dragHandleProps} />;
    default:
      return <div>Unknown widget type</div>;
  }
};

const AddWidgetModal = ({ isOpen, onClose, onAdd }) => {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState('');
  const [selectedDevice, setSelectedDevice] = useState('');
  const [selectedSensor, setSelectedSensor] = useState('');
  const [title, setTitle] = useState('');

  const handleAdd = () => {
    if (!selectedType || !title) return;
    
    onAdd({
      id: Date.now().toString(),
      type: selectedType,
      title,
      device: selectedDevice,
      sensor: selectedSensor
    });
    
    setStep(1);
    setSelectedType('');
    setSelectedDevice('');
    setSelectedSensor('');
    setTitle('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Add Widget</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          <div className="mb-6">
            <div className="flex items-center">
              {[1, 2, 3].map((num) => (
                <React.Fragment key={num}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {num}
                  </div>
                  {num < 3 && (
                    <div className={`flex-1 h-1 mx-2 ${step > num ? 'bg-blue-600' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>Widget Type</span>
              <span>Device & Sensor</span>
              <span>Configuration</span>
            </div>
          </div>

          {step === 1 && (
            <div>
              <h3 className="font-medium mb-4">Select Widget Type</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {widgetTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <div
                      key={type.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedType === type.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedType(type.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <Icon className={`w-5 h-5 mt-0.5 ${
                          selectedType === type.id ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                        <div>
                          <h4 className="font-medium text-gray-900">{type.name}</h4>
                          <p className="text-sm text-gray-600">{type.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Device</label>
                <select
                  value={selectedDevice}
                  onChange={(e) => setSelectedDevice(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose a device...</option>
                  {mockDevices.map((device) => (
                    <option key={device.id} value={device.name}>
                      {device.name} ({device.type})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Sensor</label>
                <select
                  value={selectedSensor}
                  onChange={(e) => setSelectedSensor(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose a sensor...</option>
                  {mockSensors.map((sensor) => (
                    <option key={sensor} value={sensor}>{sensor}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Widget Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter widget title..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Preview</h4>
                <div className="text-sm text-gray-600">
                  <p><strong>Type:</strong> {widgetTypes.find(t => t.id === selectedType)?.name}</p>
                  <p><strong>Device:</strong> {selectedDevice || 'Not selected'}</p>
                  <p><strong>Sensor:</strong> {selectedSensor || 'Not selected'}</p>
                  <p><strong>Title:</strong> {title || 'Untitled'}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && !selectedType}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleAdd}
                disabled={!selectedType || !title}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Widget
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [widgets, setWidgets] = useState([
    { id: '1', type: 'temp-chart', title: 'Temperature Trend', device: 'Chamber A', sensor: 'Temperature' },
    { id: '2', type: 'temp-gauge', title: 'Current Temperature', device: 'Chamber A', sensor: 'Temperature' },
    { id: '3', type: 'sensor-card', title: 'Product Temperature', device: 'Chamber B', sensor: 'Temperature' },
    { id: '4', type: 'digital-status', title: 'Digital I/O Status', device: 'Chamber A', sensor: '' },
    { id: '5', type: 'electrical', title: 'Electrical Monitoring', device: 'Chamber A', sensor: 'Current' },
    { id: '6', type: 'alarm-panel', title: 'Active Alarms', device: '', sensor: '' },
    { id: '7', type: 'system-overview', title: 'System Overview', device: '', sensor: '' },
    { id: '8', type: 'environmental', title: 'Environmental Sensors', device: 'Chamber A', sensor: 'Humidity' }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);

  const addWidget = (widget) => {
    setWidgets([...widgets, widget]);
  };

  const removeWidget = (id) => {
    setWidgets(widgets.filter(w => w.id !== id));
  };

  const reorderWidgets = (fromIndex, toIndex) => {
    const newWidgets = [...widgets];
    const [removed] = newWidgets.splice(fromIndex, 1);
    newWidgets.splice(toIndex, 0, removed);
    setWidgets(newWidgets);
  };

  const openSettings = (id) => {
    console.log('Settings for widget:', id);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Snowflake className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Koronka Cooling System</h1>
                <p className="text-sm text-gray-600">IoT Dashboard - Meat Processing Control</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>System Online</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>3 Chambers Active</span>
              </div>
              <div className="text-sm text-gray-600">
                Last update: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <Thermometer className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Avg Temperature</p>
                <p className="text-2xl font-bold text-gray-900">-18.2°C</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <Fan className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Active Units</p>
                <p className="text-2xl font-bold text-gray-900">3/3</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Active Alarms</p>
                <p className="text-2xl font-bold text-gray-900">2</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <Zap className="w-8 h-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Power Usage</p>
                <p className="text-2xl font-bold text-gray-900">8.5 kW</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <Wrench className="w-8 h-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Maintenance Due</p>
                <p className="text-2xl font-bold text-gray-900">1</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 widget-grid">
          {widgets.map((widget, index) => (
            <div key={widget.id} className="min-h-[320px]">
              <DraggableWidget
                widget={widget}
                index={index}
                onRemove={() => removeWidget(widget.id)}
                onSettings={() => openSettings(widget.id)}
                onReorder={reorderWidgets}
              />
            </div>
          ))}
        </div>

        {widgets.length === 0 && (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No widgets added yet</h3>
            <p className="text-gray-600 mb-6">Get started by adding your first widget to monitor your cooling chambers.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Widget
            </button>
          </div>
        )}
      </div>

      {widgets.length > 0 && (
        <button
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      <AddWidgetModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addWidget}
      />
    </div>
  );
}