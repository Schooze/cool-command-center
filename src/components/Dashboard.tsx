// src/components/Dashboard.tsx
// Updated Dashboard dengan widget terpisah dan data InfluxDB asli

import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Thermometer, Power, AlertTriangle, Zap, Activity, BarChart3, Gauge, Droplets } from 'lucide-react';

// Import widget components dari file terpisah
import {
  TempChartWidget,
  TempGaugeWidget,
  SensorCardWidget,
  DigitalStatusWidget,
  ElectricalWidget,
  EnvironmentalWidget,
  AlarmPanelWidget,
  SystemOverviewWidget,
  WidgetConfig,
  WidgetType
} from './widgets';

import WidgetConfigPopup from './widgets/WidgetConfigPopup';

// Import services
import { deviceService } from '@/services/deviceService';

// Enhanced type definitions
interface ConnectedDevice {
  id: string;
  serial_number: string;
  name: string;
  product_type_name: string;
  status: 'online' | 'offline';
}

interface SensorDefinition {
  id: string;
  name: string;
  field: string;
  measurement: string;
  unit: string;
  supportedWidgets: string[];
  description: string;
}

// Sensor mappings berdasarkan InfluxDB structure
const SENSOR_DEFINITIONS: SensorDefinition[] = [
  {
    id: 'P1_T',
    name: 'Product Temp 1',
    field: 'P1_T',
    measurement: 'sensor_data',
    unit: '°C',
    supportedWidgets: ['temp-chart', 'temp-gauge', 'sensor-card'],
    description: 'Temperature sensor 1 for product monitoring'
  },
  {
    id: 'P2_T',
    name: 'Product Temp 2',
    field: 'P2_T',
    measurement: 'sensor_data',
    unit: '°C',
    supportedWidgets: ['temp-chart', 'temp-gauge', 'sensor-card'],
    description: 'Temperature sensor 2 for product monitoring'
  },
  {
    id: 'E_T',
    name: 'Evaporator Temp',
    field: 'E_T',
    measurement: 'sensor_data',
    unit: '°C',
    supportedWidgets: ['temp-chart', 'temp-gauge', 'sensor-card'],
    description: 'Evaporator temperature sensor'
  },
  {
    id: 'A_T',
    name: 'Ambient Temp',
    field: 'A_T',
    measurement: 'sensor_data',
    unit: '°C',
    supportedWidgets: ['temp-chart', 'temp-gauge', 'sensor-card'],
    description: 'Ambient temperature sensor'
  },
  {
    id: 'C_T',
    name: 'Condensor Temp',
    field: 'C_T',
    measurement: 'sensor_data',
    unit: '°C',
    supportedWidgets: ['temp-chart', 'temp-gauge', 'sensor-card'],
    description: 'Condensor temperature sensor'
  },
  {
    id: 'HUMIDITY',
    name: 'Humidity',
    field: 'H',
    measurement: 'sensor_data',
    unit: '%',
    supportedWidgets: ['environmental'],
    description: 'Environmental humidity sensor'
  },
  {
    id: 'PRESSURE',
    name: 'Pressure',
    field: 'P',
    measurement: 'sensor_data',
    unit: 'hPa',
    supportedWidgets: ['environmental'],
    description: 'Environmental pressure sensor'
  },
  {
    id: 'CURRENT',
    name: 'Current',
    field: 'Current',
    measurement: 'sensor_data',
    unit: 'A',
    supportedWidgets: ['electrical'],
    description: 'Electrical current measurement'
  },
  {
    id: 'VOLTAGE',
    name: 'Voltage',
    field: 'Voltage',
    measurement: 'sensor_data',
    unit: 'V',
    supportedWidgets: ['electrical'],
    description: 'Electrical voltage measurement'
  },
  {
    id: 'DOOR_SWITCH',
    name: 'Door Switch',
    field: 'door_L',
    measurement: 'sensor_data',
    unit: '',
    supportedWidgets: ['digital-status'],
    description: 'Door limit switch status'
  },
  {
    id: 'COMPRESSOR',
    name: 'Compressor',
    field: 'compressor_OUT',
    measurement: 'sensor_data',
    unit: '',
    supportedWidgets: ['digital-status'],
    description: 'Compressor relay output status'
  },
  {
    id: 'DEFROST',
    name: 'Defrost Heater',
    field: 'defrost_OUT',
    measurement: 'sensor_data',
    unit: '',
    supportedWidgets: ['digital-status'],
    description: 'Defrost relay output status'
  },
  {
    id: 'FAN',
    name: 'Fan',
    field: 'fan_OUT',
    measurement: 'sensor_data',
    unit: '',
    supportedWidgets: ['digital-status'],
    description: 'Fan relay output status'
  },
  {
    id: 'LIGHT',
    name: 'Light',
    field: 'light_OUT',
    measurement: 'sensor_data',
    unit: '',
    supportedWidgets: ['digital-status'],
    description: 'Light relay output status'
  }
];

const widgetTypes: WidgetType[] = [
  { id: 'temp-chart', name: 'Temperature Chart', icon: BarChart3, description: 'Temperature trend chart' },
  { id: 'temp-gauge', name: 'Temperature Gauge', icon: Gauge, description: 'Real-time temperature gauge' },
  { id: 'sensor-card', name: 'Sensor Card', icon: Thermometer, description: 'Individual sensor display' },
  { id: 'digital-status', name: 'Digital I/O', icon: Power, description: 'Digital inputs/outputs status' },
  { id: 'electrical', name: 'Electrical', icon: Zap, description: 'Current and voltage monitoring' },
  { id: 'alarm-panel', name: 'Alarm Panel', icon: AlertTriangle, description: 'Active alarms display' },
  { id: 'system-overview', name: 'System Overview', icon: Activity, description: 'Overall system status' },
  { id: 'environmental', name: 'Environmental', icon: Droplets, description: 'Humidity and pressure' }
];

// Drag and Drop Implementation
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

// Updated AddWidgetModal dengan alur baru: Device & Sensor -> Widget Type -> Configuration
const AddWidgetModal = ({ isOpen, onClose, onAdd }) => {
  const [step, setStep] = useState(1);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [selectedSensor, setSelectedSensor] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [title, setTitle] = useState('');
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch devices saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      fetchDevices();
    }
  }, [isOpen]);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const devices = await deviceService.getProducts();
      setConnectedDevices(devices);
    } catch (error) {
      console.error('Error fetching devices:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get available sensors for selected device
  const getAvailableSensors = () => {
    return SENSOR_DEFINITIONS;
  };

  // Get available widget types for selected sensor
  const getAvailableWidgetTypes = () => {
    if (!selectedSensor) return [];
    
    const sensor = SENSOR_DEFINITIONS.find(s => s.id === selectedSensor);
    if (!sensor) return [];
    
    return widgetTypes.filter(wt => sensor.supportedWidgets.includes(wt.id));
  };

  const handleAdd = () => {
    if (!selectedType || !title || !selectedDevice || !selectedSensor) return;
    
    const selectedDeviceData = connectedDevices.find(d => d.id === selectedDevice);
    const selectedSensorData = SENSOR_DEFINITIONS.find(s => s.id === selectedSensor);
    
    onAdd({
      id: Date.now().toString(),
      type: selectedType,
      title,
      device: selectedDeviceData?.name || '',
      sensor: selectedSensorData?.name || '',
      chipId: selectedDeviceData?.serial_number || '',
      config: {
        deviceId: selectedDevice,
        sensorId: selectedSensor,
        sensorField: selectedSensorData?.field || '',
        measurement: selectedSensorData?.measurement || 'sensor_data'
      }
    });
    
    // Reset form
    setStep(1);
    setSelectedDevice('');
    setSelectedSensor('');
    setSelectedType('');
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

          {/* Step indicator - Updated order */}
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
            <div className="flex justify-between mt-2 text-xs text-gray-600">
              <span>Device & Sensor</span>
              <span>Widget Type</span>
              <span>Configuration</span>
            </div>
          </div>

          {/* Step 1: Device & Sensor Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Device</label>
                {loading ? (
                  <div className="text-sm text-gray-500">Loading devices...</div>
                ) : (
                  <select
                    value={selectedDevice}
                    onChange={(e) => setSelectedDevice(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Choose a device...</option>
                    {connectedDevices.map((device) => (
                      <option key={device.id} value={device.id}>
                        {device.name} ({device.serial_number}) - {device.status}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Sensor</label>
                <select
                  value={selectedSensor}
                  onChange={(e) => setSelectedSensor(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!selectedDevice}
                >
                  <option value="">Choose a sensor...</option>
                  {getAvailableSensors().map((sensor) => (
                    <option key={sensor.id} value={sensor.id}>
                      {sensor.name} ({sensor.field}) - {sensor.unit}
                    </option>
                  ))}
                </select>
              </div>
              {selectedSensor && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    {SENSOR_DEFINITIONS.find(s => s.id === selectedSensor)?.description}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Widget Type Selection */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Select Widget Type</h4>
                <div className="space-y-2">
                  {getAvailableWidgetTypes().map((type) => {
                    const Icon = type.icon;
                    return (
                      <label key={type.id} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="widgetType"
                          value={type.id}
                          checked={selectedType === type.id}
                          onChange={(e) => setSelectedType(e.target.value)}
                          className="mr-3"
                        />
                        <Icon className="w-5 h-5 mr-3 text-gray-600" />
                        <div>
                          <div className="font-medium">{type.name}</div>
                          <div className="text-sm text-gray-600">{type.description}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Configuration */}
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
                  <p><strong>Device:</strong> {connectedDevices.find(d => d.id === selectedDevice)?.name || 'Not selected'}</p>
                  <p><strong>Sensor:</strong> {SENSOR_DEFINITIONS.find(s => s.id === selectedSensor)?.name || 'Not selected'}</p>
                  <p><strong>Widget Type:</strong> {widgetTypes.find(t => t.id === selectedType)?.name || 'Not selected'}</p>
                  <p><strong>Title:</strong> {title || 'Untitled'}</p>
                  <p><strong>Data Source:</strong> InfluxDB - coolingmonitoring bucket</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
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
                disabled={(step === 1 && (!selectedDevice || !selectedSensor)) || (step === 2 && !selectedType)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleAdd}
                disabled={!selectedType || !title || !selectedDevice || !selectedSensor}
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
  const [widgets, setWidgets] = useState<WidgetConfig[]>([
    { 
      id: '1', 
      type: 'temp-chart', 
      title: 'Product Temperature Trend', 
      device: 'Chamber A', 
      sensor: 'Product Temp 1',
      chipId: 'F0101ABC123',
      config: { deviceId: '1', sensorId: 'P1_T', sensorField: 'P1_T', measurement: 'sensor_data' }
    },
    { 
      id: '2', 
      type: 'temp-gauge', 
      title: 'Current Temperature', 
      device: 'Chamber A', 
      sensor: 'Product Temp 1',
      chipId: 'F0101ABC123',
      config: { deviceId: '1', sensorId: 'P1_T', sensorField: 'P1_T', measurement: 'sensor_data' }
    },
    { 
      id: '3', 
      type: 'sensor-card', 
      title: 'Evaporator Temperature', 
      device: 'Chamber B', 
      sensor: 'Evaporator Temp',
      chipId: 'F0101DEF456',
      config: { deviceId: '2', sensorId: 'E_T', sensorField: 'E_T', measurement: 'sensor_data' }
    },
    { 
      id: '4', 
      type: 'digital-status', 
      title: 'Equipment Status', 
      device: 'Chamber A', 
      sensor: 'Digital I/O',
      chipId: 'F0101ABC123',
      config: { deviceId: '1', measurement: 'sensor_data' }
    },
    { 
      id: '5', 
      type: 'electrical', 
      title: 'Power Monitoring', 
      device: 'Chamber A', 
      sensor: 'Electrical',
      chipId: 'F0101ABC123',
      config: { deviceId: '1', measurement: 'sensor_data' }
    },
    { 
      id: '6', 
      type: 'alarm-panel', 
      title: 'Active Alarms', 
      device: '', 
      sensor: '',
      config: { systemWide: true }
    },
    { 
      id: '7', 
      type: 'system-overview', 
      title: 'System Overview', 
      device: '', 
      sensor: '',
      config: { systemWide: true }
    },
    { 
      id: '8', 
      type: 'environmental', 
      title: 'Environmental Conditions', 
      device: 'Chamber A', 
      sensor: 'Environmental',
      chipId: 'F0101ABC123',
      config: { deviceId: '1', measurement: 'sensor_data' }
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfigPopup, setShowConfigPopup] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<WidgetConfig | null>(null);

  const addWidget = (widget: WidgetConfig) => {
    setWidgets([...widgets, widget]);
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
  };

  const reorderWidgets = (fromIndex: number, toIndex: number) => {
    const newWidgets = [...widgets];
    const [removed] = newWidgets.splice(fromIndex, 1);
    newWidgets.splice(toIndex, 0, removed);
    setWidgets(newWidgets);
  };

  const openSettings = (id: string) => {
    const widget = widgets.find(w => w.id === id);
    if (widget) {
      setSelectedWidget(widget);
      setShowConfigPopup(true);
    } else {
      console.warn('Widget not found:', id);
    }
  };

  const handleWidgetUpdate = (updatedWidget: WidgetConfig) => {
    setWidgets(prevWidgets => 
      prevWidgets.map(w => 
        w.id === updatedWidget.id ? updatedWidget : w
      )
    );
    setSelectedWidget(null);
    setShowConfigPopup(false);
  };

  const handleConfigClose = () => {
    setSelectedWidget(null);
    setShowConfigPopup(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Thermometer className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Avg Temperature</p>
                <p className="text-lg font-bold text-gray-900">-18.2°C</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Power className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Active Devices</p>
                <p className="text-lg font-bold text-gray-900">3/3</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Alarms</p>
                <p className="text-lg font-bold text-gray-900">2</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Power Usage</p>
                <p className="text-lg font-bold text-gray-900">7.8kW</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Activity className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">System Health</p>
                <p className="text-lg font-bold text-gray-900">95%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Widget Grid */}
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

        {/* Empty State */}
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

      {/* Floating Add Button */}
      {widgets.length > 0 && (
        <button
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Modals */}
      <AddWidgetModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addWidget}
      />

      <WidgetConfigPopup
        isOpen={showConfigPopup}
        onClose={handleConfigClose}
        widget={selectedWidget}
        onSave={handleWidgetUpdate}
      />
    </div>
  );
}