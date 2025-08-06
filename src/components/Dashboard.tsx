import { useState, useEffect, useRef, DragEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Thermometer, 
  Droplets, 
  Gauge, 
  Zap, 
  Power, 
  Activity,
  Move,
  RotateCcw,
  Save,
  Settings
} from 'lucide-react';

// Mock Data
const mockSensorData = {
  temperature: [
    { id: 'ntc1', name: 'Evaporator Temp', value: -18.5, unit: '°C', status: 'normal' as const, min: -25, max: -15 },
    { id: 'ntc2', name: 'Product Temp', value: -16.2, unit: '°C', status: 'normal' as const, min: -20, max: -10 },
    { id: 'ntc3', name: 'Ambient Temp', value: 22.1, unit: '°C', status: 'normal' as const, min: 15, max: 35 },
    { id: 'ntc4', name: 'Condenser Temp', value: 45.3, unit: '°C', status: 'warning' as const, min: 30, max: 60 },
  ],
  humidity: { value: 65.2, unit: '%', status: 'normal' as const },
  pressure: { value: 1013.2, unit: 'hPa', status: 'normal' as const },
  electrical: {
    current: { value: 8.5, unit: 'A', status: 'normal' as const },
    voltage: { value: 230.2, unit: 'V', status: 'normal' as const },
  },
  digitalInputs: [
    { id: 'di1', name: 'Door Switch', active: false },
    { id: 'di2', name: 'Emergency Stop', active: false },
    { id: 'di3', name: 'High Pressure', active: false },
  ],
  digitalOutputs: [
    { id: 'do1', name: 'Compressor', active: true },
    { id: 'do2', name: 'Fan 1', active: true },
    { id: 'do3', name: 'Fan 2', active: false },
    { id: 'do4', name: 'Defrost Heater', active: false },
    { id: 'do5', name: 'Alarm', active: false },
  ]
};

type WidgetSize = '1x1' | '2x1' | '3x1' | '2x2' | '2x3' | '3x3';

interface Widget {
  id: string;
  type: string;
  title: string;
  size: WidgetSize;
  position: { x: number; y: number };
  data?: any;
}

const WIDGET_SIZES = {
  '1x1': { width: 1, height: 1 },
  '2x1': { width: 2, height: 1 },
  '3x1': { width: 3, height: 1 },
  '2x2': { width: 2, height: 2 },
  '2x3': { width: 2, height: 3 },
  '3x3': { width: 3, height: 3 },
};

const GRID_SIZE = 200; // pixels per grid unit

const DraggableIoTDashboard = () => {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [draggedWidget, setDraggedWidget] = useState<Widget | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isConfigMode, setIsConfigMode] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  // Default widgets configuration
  const defaultWidgets: Widget[] = [
    {
      id: 'temp-sensors',
      type: 'temperature',
      title: 'Temperature Sensors',
      size: '3x3',
      position: { x: 0, y: 0 },
      data: mockSensorData.temperature
    },
    {
      id: 'humidity',
      type: 'humidity',
      title: 'Humidity Monitor',
      size: '1x1',
      position: { x: 3, y: 0 },
      data: mockSensorData.humidity
    },
    {
      id: 'pressure',
      type: 'pressure',
      title: 'Pressure Monitor',
      size: '1x1',
      position: { x: 4, y: 0 },
      data: mockSensorData.pressure
    },
    {
      id: 'electrical',
      type: 'electrical',
      title: 'Electrical Monitoring',
      size: '2x1',
      position: { x: 0, y: 2 },
      data: mockSensorData.electrical
    },
    {
      id: 'digital-inputs',
      type: 'digital',
      title: 'Digital Inputs',
      size: '2x2',
      position: { x: 2, y: 2 },
      data: mockSensorData.digitalInputs
    },
    {
      id: 'digital-outputs',
      type: 'digital',
      title: 'Digital Outputs',
      size: '2x2',
      position: { x: 4, y: 1 },
      data: mockSensorData.digitalOutputs
    }
  ];

  // In-memory storage for layout (replaces localStorage)
  const [savedLayouts, setSavedLayouts] = useState<{ [key: string]: Widget[] }>({});

  // Load layout from in-memory storage on component mount
  useEffect(() => {
    const savedLayout = savedLayouts['current'];
    if (savedLayout) {
      setWidgets(savedLayout);
    } else {
      setWidgets(defaultWidgets);
    }
  }, []);

  // Save layout to in-memory storage
  const saveLayout = () => {
    setSavedLayouts(prev => ({
      ...prev,
      current: [...widgets]
    }));
    alert('Layout berhasil disimpan dalam sesi ini!');
  };

  // Reset layout to default
  const resetLayout = () => {
    setWidgets(defaultWidgets);
    setSavedLayouts(prev => ({
      ...prev,
      current: defaultWidgets
    }));
  };

  // Handle drag start
  const handleDragStart = (e: DragEvent, widget: Widget) => {
    if (!isConfigMode) return;
    
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const gridRect = gridRef.current?.getBoundingClientRect();
    if (!gridRect) return;

    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    
    setDraggedWidget(widget);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drag over
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Check for collision between widgets
  const checkCollision = (widget1: Widget, widget2: Widget) => {
    const size1 = WIDGET_SIZES[widget1.size];
    const size2 = WIDGET_SIZES[widget2.size];
    
    if (!size1 || !size2) return false;
    
    const x1End = widget1.position.x + size1.width;
    const y1End = widget1.position.y + size1.height;
    const x2End = widget2.position.x + size2.width;
    const y2End = widget2.position.y + size2.height;
    
    return !(
      widget1.position.x >= x2End ||
      x1End <= widget2.position.x ||
      widget1.position.y >= y2End ||
      y1End <= widget2.position.y
    );
  };

  // Find available position for widget
  const findAvailablePosition = (targetWidget: Widget, newX: number, newY: number) => {
    const size = WIDGET_SIZES[targetWidget.size];
    if (!size) return { x: 0, y: 0 };
    
    const maxX = Math.max(0, 6 - size.width);
    const maxY = Math.max(0, 6 - size.height);
    
    // Try the desired position first
    const clampedX = Math.max(0, Math.min(newX, maxX));
    const clampedY = Math.max(0, Math.min(newY, maxY));
    
    const testWidget = { ...targetWidget, position: { x: clampedX, y: clampedY } };
    
    // Check collision with other widgets
    const hasCollision = widgets.some(widget => 
      widget.id !== targetWidget.id && checkCollision(testWidget, widget)
    );
    
    if (!hasCollision) {
      return { x: clampedX, y: clampedY };
    }
    
    // Find nearest available position
    for (let y = 0; y <= maxY; y++) {
      for (let x = 0; x <= maxX; x++) {
        const testPosition = { x, y };
        const testWidgetAtPos = { ...targetWidget, position: testPosition };
        
        const hasCollisionAtPos = widgets.some(widget => 
          widget.id !== targetWidget.id && checkCollision(testWidgetAtPos, widget)
        );
        
        if (!hasCollisionAtPos) {
          return testPosition;
        }
      }
    }
    
    // Return original position if no available space
    return targetWidget.position;
  };

  // Handle drop
  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    
    if (!draggedWidget || !gridRef.current) return;

    const gridRect = gridRef.current.getBoundingClientRect();
    const newX = Math.round((e.clientX - gridRect.left - dragOffset.x) / GRID_SIZE);
    const newY = Math.round((e.clientY - gridRect.top - dragOffset.y) / GRID_SIZE);

    // Find available position (with collision detection)
    const availablePosition = findAvailablePosition(draggedWidget, newX, newY);

    setWidgets(prev => prev.map(widget => 
      widget.id === draggedWidget.id 
        ? { ...widget, position: availablePosition }
        : widget
    ));

    setDraggedWidget(null);
    setDragOffset({ x: 0, y: 0 });
  };

  // Change widget size
  const changeWidgetSize = (widgetId: string, newSize: WidgetSize) => {
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget) return;
    
    const updatedWidget = { ...widget, size: newSize };
    const availablePosition = findAvailablePosition(updatedWidget, widget.position.x, widget.position.y);
    
    setWidgets(prev => prev.map(w => 
      w.id === widgetId 
        ? { ...w, size: newSize, position: availablePosition }
        : w
    ));
  };

  // Render widget content based on type
  const renderWidgetContent = (widget: Widget) => {
    const actualSize = WIDGET_SIZES[widget.size];
    if (!actualSize) return <div className="flex items-center justify-center h-full text-gray-500">Invalid size</div>;
    
    switch (widget.type) {
      case 'temperature':
        const tempCols = actualSize.width >= 3 ? 2 : 1;
        return (
          <div className={`grid grid-cols-${tempCols} gap-2 h-full overflow-hidden`}>
            {widget.data?.slice(0, tempCols * 2).map((sensor: any) => (
              <div key={sensor.id} className="p-2 bg-gray-50 rounded flex flex-col justify-between min-h-0">
                <div className="flex items-center gap-1 mb-1">
                  <Thermometer className="h-3 w-3 flex-shrink-0" />
                  <span className="text-xs font-medium truncate">{sensor.name}</span>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold">
                    {sensor.value.toFixed(1)}{sensor.unit}
                  </div>
                  <Badge 
                    variant={sensor.status === 'normal' ? 'default' : 'destructive'}
                    className="text-xs mt-1"
                  >
                    {sensor.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'humidity':
        return (
          <div className="flex flex-col items-center justify-center h-full p-2">
            <Droplets className={`${actualSize.width === 1 ? 'h-6 w-6' : 'h-8 w-8'} text-blue-500 mb-2 flex-shrink-0`} />
            <div className={`${actualSize.width === 1 ? 'text-lg' : 'text-2xl'} font-bold`}>
              {widget.data?.value}%
            </div>
            <Badge variant="default" className="text-xs mt-1">
              {widget.data?.status}
            </Badge>
          </div>
        );
      
      case 'pressure':
        return (
          <div className="flex flex-col items-center justify-center h-full p-2">
            <Gauge className={`${actualSize.width === 1 ? 'h-6 w-6' : 'h-8 w-8'} text-green-500 mb-2 flex-shrink-0`} />
            <div className={`${actualSize.width === 1 ? 'text-sm' : 'text-xl'} font-bold text-center`}>
              {widget.data?.value} hPa
            </div>
            <Badge variant="default" className="text-xs mt-1">
              {widget.data?.status}
            </Badge>
          </div>
        );
      
      case 'electrical':
        return (
          <div className="grid grid-cols-2 gap-2 h-full p-2">
            <div className="flex flex-col items-center justify-center">
              <Zap className="h-5 w-5 text-yellow-500 mb-1 flex-shrink-0" />
              <div className="text-sm font-bold">{widget.data?.current.value}A</div>
              <span className="text-xs">Current</span>
            </div>
            <div className="flex flex-col items-center justify-center">
              <Power className="h-5 w-5 text-red-500 mb-1 flex-shrink-0" />
              <div className="text-sm font-bold">{widget.data?.voltage.value}V</div>
              <span className="text-xs">Voltage</span>
            </div>
          </div>
        );
      
      case 'digital':
        const maxItems = actualSize.height <= 1 ? 2 : actualSize.height * 2;
        return (
          <div className="space-y-1 h-full overflow-hidden p-2">
            {widget.data?.slice(0, maxItems).map((item: any) => (
              <div key={item.id} className="flex items-center justify-between p-1.5 bg-gray-50 rounded text-xs">
                <span className="truncate pr-2">{item.name}</span>
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${item.active ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>
            ))}
          </div>
        );
      
      default:
        return <div className="flex items-center justify-center h-full text-gray-500">No data</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="mb-6 bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Koronka Control Center</h1>
            <p className="text-gray-600">IoT Dashboard - Ruang Kontrol Pendingin Daging</p>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant={isConfigMode ? "default" : "outline"}
              onClick={() => setIsConfigMode(!isConfigMode)}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              {isConfigMode ? 'Exit Config' : 'Configure'}
            </Button>
            
            <Button
              onClick={saveLayout}
              className="flex items-center gap-2"
              disabled={!isConfigMode}
            >
              <Save className="h-4 w-4" />
              Save Layout
            </Button>
            
            <Button
              onClick={resetLayout}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div 
        ref={gridRef}
        className="relative bg-white rounded-lg shadow-md p-4"
        style={{ 
          minHeight: '800px',
          backgroundImage: isConfigMode ? 
            `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0)` : 'none',
          backgroundSize: isConfigMode ? `${GRID_SIZE}px ${GRID_SIZE}px` : 'auto'
        }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {widgets.map((widget) => {
          const size = WIDGET_SIZES[widget.size];
          
          // Safety check - fallback to 1x1 if size is not found
          if (!size) {
            console.warn(`Invalid widget size: ${widget.size}, falling back to 1x1`);
            widget.size = '1x1';
          }
          
          const actualSize = WIDGET_SIZES[widget.size];
          
          return (
            <Card
              key={widget.id}
              className={`absolute cursor-${isConfigMode ? 'move' : 'default'} transition-all duration-200 hover:shadow-lg ${
                isConfigMode ? 'ring-2 ring-blue-300' : ''
              }`}
              style={{
                left: widget.position.x * GRID_SIZE,
                top: widget.position.y * GRID_SIZE,
                width: actualSize.width * GRID_SIZE - 8,
                height: actualSize.height * GRID_SIZE - 8,
              }}
              draggable={isConfigMode}
              onDragStart={(e) => handleDragStart(e, widget)}
            >
              <CardHeader className="pb-2 px-3 py-2">
                <CardTitle className={`${actualSize.height === 1 ? 'text-sm' : 'text-base'} flex items-center justify-between`}>
                  <span className="truncate pr-2">{widget.title}</span>
                  {isConfigMode && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Move className="h-3 w-3 text-gray-400" />
                      <select
                        value={widget.size}
                        onChange={(e) => changeWidgetSize(widget.id, e.target.value as WidgetSize)}
                        className="text-xs border rounded px-1 py-0.5 w-12"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {Object.keys(WIDGET_SIZES).map(size => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-1 min-h-0">
                {renderWidgetContent(widget)}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {isConfigMode && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Configuration Mode</h3>
          <p className="text-blue-700 text-sm">
            • Drag widgets to reposition them<br/>
            • Use dropdown to change widget size<br/>
            • Click "Save Layout" to persist changes (dalam sesi ini)<br/>
            • Grid shows available positions<br/>
            <span className="text-xs text-blue-600">
              * Layout akan tersimpan selama sesi aplikasi ini aktif
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default DraggableIoTDashboard;