// components/widgets/DigitalStatusWidget.tsx
import React from 'react';
import { Settings, X, GripVertical } from 'lucide-react';

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

export default DigitalStatusWidget;