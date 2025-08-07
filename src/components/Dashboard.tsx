import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Thermometer, 
  Droplets, 
  Power, 
  Activity, 
  Gauge, 
  Table,
  Edit,
  FileText,
  Wifi,
  WifiOff,
  MoreVertical,
  Maximize2
} from 'lucide-react';

// Types
interface Widget {
  id: string;
  deviceId: string;
  type: 'switch' | 'slider' | 'label' | 'status' | 'table';
  title: string;
  sensors: string[];
  value?: number | boolean | string;
  gridPosition: { row: number; col: number; width: number; height: number };
  online?: boolean;
}

interface MockDevice {
  id: string;
  name: string;
  online: boolean;
  sensors: string[];
  data: { [key: string]: number | boolean };
}

const Dashboard = () => {
  const [widgets, setWidgets] = useState<Widget[]>([
    {
      id: 'w1',
      deviceId: 'device-001',
      type: 'label',
      title: 'Temperature Sensor',
      sensors: ['temperature'],
      value: -16.2,
      gridPosition: { row: 1, col: 1, width: 2, height: 2 },
      online: true
    },
    {
      id: 'w2',
      deviceId: 'device-001',
      type: 'switch',
      title: 'Compressor Control',
      sensors: ['compressor'],
      value: true,
      gridPosition: { row: 1, col: 3, width: 2, height: 2 },
      online: true
    },
    {
      id: 'w3',
      deviceId: 'device-002',
      type: 'status',
      title: 'System Status',
      sensors: [],
      gridPosition: { row: 3, col: 1, width: 3, height: 2 },
      online: false
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    deviceId: '',
    selectedSensors: [] as string[],
    widgetType: 'label' as Widget['type']
  });

  // Mock data for available devices and sensors
  const mockDevices: MockDevice[] = [
    {
      id: 'device-001',
      name: 'Freezer Unit A',
      online: true,
      sensors: ['temperature', 'humidity', 'compressor', 'fan'],
      data: { temperature: -16.2, humidity: 65, compressor: true, fan: true }
    },
    {
      id: 'device-002',
      name: 'Cooling Unit B',
      online: false,
      sensors: ['temperature', 'pressure', 'valve'],
      data: { temperature: 0, pressure: 0, valve: false }
    }
  ];

  const availableSensors = [
    'temperature', 'humidity', 'pressure', 'compressor', 
    'fan', 'valve', 'alarm', 'defrost'
  ];

  const widgetTypes = [
    { value: 'switch', label: 'Switch (Toggle)', icon: Power },
    { value: 'slider', label: 'Slider', icon: Gauge },
    { value: 'label', label: 'Label (Numeric)', icon: Activity },
    { value: 'status', label: 'Device Status', icon: Wifi },
    { value: 'table', label: 'Device Table', icon: Table }
  ];

  // Generate 12-column grid (12x8 = 96 cells)
  const generateGridCells = () => {
    const cells = [];
    for (let row = 1; row <= 8; row++) {
      for (let col = 1; col <= 12; col++) {
        const occupied = widgets.some(widget => {
          const w = widget.gridPosition;
          return col >= w.col && col < w.col + w.width &&
                 row >= w.row && row < w.row + w.height;
        });
        
        cells.push(
          <div
            key={`${row}-${col}`}
            className={`
              h-20 border border-gray-200 rounded-lg
              ${occupied ? 'bg-transparent border-transparent' : 'bg-gray-50 hover:bg-gray-100'}
              transition-colors duration-200
            `}
            style={{
              gridColumn: col,
              gridRow: row
            }}
          />
        );
      }
    }
    return cells;
  };

  const handleAddWidget = () => {
    if (!formData.deviceId || formData.selectedSensors.length === 0) return;

    const newWidget: Widget = {
      id: `w${Date.now()}`,
      deviceId: formData.deviceId,
      type: formData.widgetType,
      title: `${formData.widgetType.charAt(0).toUpperCase() + formData.widgetType.slice(1)} Widget`,
      sensors: formData.selectedSensors,
      gridPosition: { row: 1, col: 1, width: 2, height: 2 },
      online: mockDevices.find(d => d.id === formData.deviceId)?.online || false
    };

    setWidgets([...widgets, newWidget]);
    setIsModalOpen(false);
    setFormData({ deviceId: '', selectedSensors: [], widgetType: 'label' });
  };

  const renderWidget = (widget: Widget) => {
    const device = mockDevices.find(d => d.id === widget.deviceId);
    const IconComponent = widgetTypes.find(t => t.value === widget.type)?.icon || Activity;

    return (
      <Card
        key={widget.id}
        className="bg-white shadow-lg rounded-2xl border-0 overflow-hidden transition-all duration-300 hover:shadow-xl"
        style={{
          gridColumn: `${widget.gridPosition.col} / span ${widget.gridPosition.width}`,
          gridRow: `${widget.gridPosition.row} / span ${widget.gridPosition.height}`
        }}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconComponent className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Badge 
                variant="outline" 
                className={`text-xs ${widget.online ? 'text-green-600 border-green-600' : 'text-red-600 border-red-600'}`}
              >
                {widget.online ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
                {widget.online ? 'Online' : 'Offline'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {widget.type === 'label' && (
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {device?.data[widget.sensors[0]] || 0}
                  {widget.sensors[0] === 'temperature' ? '°C' : 
                   widget.sensors[0] === 'humidity' ? '%' : 
                   widget.sensors[0] === 'pressure' ? 'bar' : ''}
                </div>
                <div className="text-xs text-gray-500">{widget.sensors[0]}</div>
              </div>
            )}
            
            {widget.type === 'switch' && (
              <div className="text-center">
                <div className={`
                  inline-block w-12 h-6 rounded-full transition-colors duration-200
                  ${device?.data[widget.sensors[0]] ? 'bg-blue-600' : 'bg-gray-300'}
                `}>
                  <div className={`
                    w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 transform mt-0.5
                    ${device?.data[widget.sensors[0]] ? 'translate-x-6' : 'translate-x-0.5'}
                  `} />
                </div>
                <div className="text-xs text-gray-500 mt-1">{widget.sensors[0]}</div>
              </div>
            )}
            
            {widget.type === 'status' && (
              <div className="space-y-2">
                <div className="text-xs text-gray-600">Device: {device?.name}</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {device?.sensors.map(sensor => (
                    <div key={sensor} className="flex justify-between">
                      <span>{sensor}:</span>
                      <span className={widget.online ? 'text-green-600' : 'text-red-600'}>
                        {widget.online ? 'OK' : 'Error'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {widget.type === 'slider' && (
              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((device?.data[widget.sensors[0]] as number || 0) + 20) * 2.5}%` }}
                  />
                </div>
                <div className="text-center text-sm font-medium">
                  {device?.data[widget.sensors[0]] || 0}°C
                </div>
              </div>
            )}
            
            {widget.type === 'table' && (
              <div className="space-y-1 text-xs">
                {Object.entries(device?.data || {}).slice(0, 3).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-600">{key}:</span>
                    <span className="font-medium">
                      {typeof value === 'boolean' ? (value ? 'ON' : 'OFF') : value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </CardContent>
        
        {/* Widget Resize Handle - Outside of CardContent */}
        <div className="absolute bottom-2 right-2 text-gray-400 hover:text-gray-600 cursor-se-resize transition-colors duration-200">
          <Maximize2 className="h-4 w-4 rotate-90" />
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">New Dashboard</h1>
          <p className="text-gray-600">Build your IoT control interface</p>
        </div>

        {/* 12-Column Grid Canvas */}
        <div className="relative mb-8">
          <div 
            className="grid gap-3 p-6 bg-white rounded-2xl shadow-sm border"
            style={{ 
              gridTemplateColumns: 'repeat(12, 1fr)',
              gridTemplateRows: 'repeat(8, 80px)',
              minHeight: '720px'
            }}
          >
            {/* Grid cells */}
            {generateGridCells()}
            
            {/* Widgets */}
            {widgets.map(renderWidget)}
          </div>
        </div>

        {/* Floating Add Button */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button
              className="fixed bottom-8 right-8 w-14 h-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white z-10"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-md mx-auto animate-in slide-in-from-top duration-300">
            <DialogHeader>
              <DialogTitle>Add New Widget</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Device ID Input */}
              <div className="space-y-2">
                <Label htmlFor="deviceId">Device ID (UUID)</Label>
                <Input
                  id="deviceId"
                  placeholder="e.g., device-001"
                  value={formData.deviceId}
                  onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                />
              </div>

              {/* Sensor Selection */}
              <div className="space-y-3">
                <Label>Select Sensors</Label>
                <div className="grid grid-cols-2 gap-2">
                  {availableSensors.map(sensor => (
                    <div key={sensor} className="flex items-center space-x-2">
                      <Checkbox
                        id={sensor}
                        checked={formData.selectedSensors.includes(sensor)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({
                              ...formData,
                              selectedSensors: [...formData.selectedSensors, sensor]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              selectedSensors: formData.selectedSensors.filter(s => s !== sensor)
                            });
                          }
                        }}
                      />
                      <label htmlFor={sensor} className="text-sm capitalize">
                        {sensor}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Widget Type Selection */}
              <div className="space-y-3">
                <Label>Widget Type</Label>
                <RadioGroup 
                  value={formData.widgetType} 
                  onValueChange={(value) => setFormData({ ...formData, widgetType: value as Widget['type'] })}
                >
                  {widgetTypes.map(type => {
                    const IconComponent = type.icon;
                    return (
                      <div key={type.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={type.value} id={type.value} />
                        <label htmlFor={type.value} className="flex items-center space-x-2 text-sm cursor-pointer">
                          <IconComponent className="h-4 w-4" />
                          <span>{type.label}</span>
                        </label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button onClick={handleAddWidget} className="flex-1">
                  Add Widget
                </Button>
                <Button variant="outline" className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Device
                </Button>
                <Button variant="outline" className="flex-1">
                  <FileText className="h-4 w-4 mr-2" />
                  View Log
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Dashboard;