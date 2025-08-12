// components/widgets/AlarmPanelWidget.tsx
import React from 'react';
import { Settings, X, GripVertical, AlertTriangle } from 'lucide-react';

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

export default AlarmPanelWidget;