// File: src/components/Configuration.tsx - TAMPILAN ASLI + DeviceService yang Fixed

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Settings, Snowflake, RotateCcw, Save, Clock, Thermometer, Timer, Package, Network } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, ComposedChart } from 'recharts';
import { deviceService } from '@/services/deviceService';

// Toast hook
const useToast = () => ({
  toast: ({ title, description, variant }: { title: string; description: string; variant?: string }) => {
    console.log(`Toast: ${title} - ${description}`);
  }
});

// Backend interfaces
interface BackendProduct {
  id: string;
  serial_number: string;
  name: string;
  product_type_name: string;
  status: 'online' | 'offline';
  installed_at: string;
  location_lat?: number;
  location_long?: number;
}

interface ConfigSaveRequest {
  device_id: string;
  parameters: {
    [key: string]: number;
  };
}

// CycleGraph component (unchanged)
const CycleGraph = ({ freezingTime, defrostTime, targetTempFreezing, targetTempDefrost, currentTime, currentTemp, currentMode }: any) => {
  const generateCycleData = () => {
    const data = [];
    const totalCycleTime = freezingTime + defrostTime;
    let currentCycleTime = 0;
    let isFreezingMode = true;
    
    for (let minute = 0; minute < 1440; minute += 15) {
      const hour = Math.floor(minute / 60);
      const min = minute % 60;
      const timeLabel = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
      
      if (currentCycleTime >= (isFreezingMode ? freezingTime : defrostTime)) {
        isFreezingMode = !isFreezingMode;
        currentCycleTime = 0;
      }
      
      const targetTemp = isFreezingMode ? targetTempFreezing : targetTempDefrost;
      const tempVariation = Math.sin((minute / 60) * 0.5) * 1 + (Math.random() - 0.5) * 0.8;
      const temperature = targetTemp + tempVariation;
      
      data.push({
        time: minute,
        timeLabel,
        temperature: Math.round(temperature * 10) / 10,
        targetTemp: targetTemp,
        mode: isFreezingMode ? 'Freezing' : 'Defrost',
        isCurrent: Math.abs(minute - currentTime) < 15,
        modeValue: isFreezingMode ? -20 : 10
      });
      
      currentCycleTime += 15;
    }
    
    return data;
  };

  const chartData = generateCycleData();
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.timeLabel}</p>
          <p className="text-sm">
            <span className="text-blue-600">Temperature: {data.temperature}°C</span>
          </p>
          <p className="text-sm">
            <span className="text-gray-600">Target: {data.targetTemp}°C</span>
          </p>
          <p className="text-sm">
            <span className={`${data.mode === 'Freezing' ? 'text-blue-600' : 'text-orange-600'}`}>
              Mode: {data.mode}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-80 w-full">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="font-medium">24-Hour Temperature Cycle</h4>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Actual Temp</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Target Temp</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-100 rounded"></div>
            <span>Freezing</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-orange-100 rounded"></div>
            <span>Defrost</span>
          </div>
        </div>
      </div>
      <div className="mt-2 text-xs text-muted-foreground text-center">
        Current: {currentTemp.toFixed(1)}°C • Mode: {currentMode} • Time: {Math.floor(currentTime / 60).toString().padStart(2, '0')}:{(currentTime % 60).toString().padStart(2, '0')}
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="timeLabel"
            interval={Math.floor(chartData.length / 12)}
            fontSize={12}
            stroke="#666"
          />
          <YAxis 
            domain={[-25, 15]}
            fontSize={12}
            stroke="#666"
            label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          
          <Line
            type="stepAfter"
            dataKey="targetTemp"
            stroke="#eab308"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="Target Temperature"
          />
          
          <Line
            type="monotone"
            dataKey="temperature"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={(props: any) => {
              if (props.payload.isCurrent) {
                return <circle cx={props.cx} cy={props.cy} r={4} fill="#ef4444" stroke="#fff" strokeWidth={2} />;
              }
              return null;
            }}
            name="Actual Temperature"
          />
          
          <ReferenceLine 
            x={chartData.find(d => d.isCurrent)?.timeLabel || chartData[Math.floor(currentTime / 15)]?.timeLabel} 
            stroke="#ef4444" 
            strokeWidth={2}
            strokeDasharray="3 3"
            label={{ value: "Now", position: "top", fill: "#ef4444", fontSize: 12 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

interface Parameter {
  id: string;
  code: string;
  name: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  description: string;
}

interface AutoModeConfig {
  freezingWindowTime: number;
  defrostWindowTime: number;
  targetTempFreezing: number;
  targetTempDefrost: number;
  cycleEnabled: boolean;
}

interface CycleStatus {
  currentMode: 'freezing' | 'defrost' | 'idle';
  timeRemaining: number;
  cycleProgress: number;
  totalCycleTime: number;
}

interface ConnectedDevice {
  id: string;
  serialNumber: string;
  name: string;
  productType: string;
  location: string;
  status: 'online' | 'offline';
  temperature: number;
}

const Configuration = () => {
  const { toast } = useToast();
  
  // Backend integration state (FIXED - using deviceService)
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Original state
  const [autoModeEnabled, setAutoModeEnabled] = useState(true);
  const [defrostActive, setDefrostActive] = useState(false);
  const [freezeActive, setFreezeActive] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  
  // Selected device
  const selectedDevice = connectedDevices.find(device => device.id === selectedDeviceId);

  // Auto mode cycle configuration
  const [autoModeConfig, setAutoModeConfig] = useState<AutoModeConfig>({
    freezingWindowTime: 240,
    defrostWindowTime: 30,
    targetTempFreezing: -18.0,
    targetTempDefrost: 8.0,
    cycleEnabled: true
  });

  // Current cycle status simulation
  const [cycleStatus, setCycleStatus] = useState<CycleStatus>({
    currentMode: 'freezing',
    timeRemaining: 180,
    cycleProgress: 25,
    totalCycleTime: 270
  });

  // Temperature and time simulation
  const [currentTemp, setCurrentTemp] = useState(-16.5);
  const [currentTime, setCurrentTime] = useState(420);

  // Default parameters (factory defaults)
  const defaultParameters: Parameter[] = [
    { id: 'f01', code: 'F01', name: 'Temperature setpoint', value: -18.0, unit: '°C', min: -30, max: 10, description: 'Target temperature for the cooling system' },
    { id: 'f02', code: 'F02', name: 'Hysteresis value', value: 2.0, unit: '°C', min: 0.1, max: 10, description: 'Temperature difference for compressor cycling' },
    { id: 'f03', code: 'F03', name: 'High alarm threshold', value: -10.0, unit: '°C', min: -20, max: 20, description: 'Temperature threshold for high alarm' },
    { id: 'f04', code: 'F04', name: 'Low alarm threshold', value: -25.0, unit: '°C', min: -40, max: 0, description: 'Temperature threshold for low alarm' },
    { id: 'f05', code: 'F05', name: 'Alarm delay time', value: 30, unit: 'min', min: 1, max: 180, description: 'Delay before triggering temperature alarms' },
    { id: 'f06', code: 'F06', name: 'Compressor delay', value: 3, unit: 'min', min: 1, max: 15, description: 'Minimum time between compressor starts' },
    { id: 'f07', code: 'F07', name: 'Defrost interval', value: 360, unit: 'min', min: 60, max: 1440, description: 'Time between automatic defrost cycles' },
    { id: 'f08', code: 'F08', name: 'Max defrost duration', value: 45, unit: 'min', min: 5, max: 120, description: 'Maximum time allowed for defrost cycle' },
    { id: 'f09', code: 'F09', name: 'Defrost stop temp', value: 8.0, unit: '°C', min: 0, max: 20, description: 'Temperature to end defrost cycle' },
    { id: 'f10', code: 'F10', name: 'Fan mode', value: 1, unit: '', min: 0, max: 2, description: '0=Off during defrost, 1=On, 2=Delayed start' },
    { id: 'f11', code: 'F11', name: 'Drip time after defrost', value: 5, unit: 'min', min: 0, max: 30, description: 'Wait time after defrost before restarting' },
    { id: 'f12', code: 'F12', name: 'Door open alarm time', value: 60, unit: 'sec', min: 10, max: 300, description: 'Time before door open alarm triggers' },
  ];

  const [parameters, setParameters] = useState<Parameter[]>(defaultParameters);

  // Fetch devices from backend using deviceService (FIXED)
  const fetchDevices = async () => {
    try {
      setLoading(true);
      const backendDevices = await deviceService.getProducts();
      
      // Convert backend format to frontend format
      const formattedDevices: ConnectedDevice[] = backendDevices.map(device => ({
        id: device.id,
        serialNumber: device.serial_number,
        name: device.name,
        productType: device.product_type_name,
        location: device.location_lat && device.location_long 
          ? `${device.location_lat.toFixed(4)}, ${device.location_long.toFixed(4)}`
          : 'Unknown Location',
        status: device.status,
        temperature: -18.0 + (Math.random() - 0.5) * 4 // Simulate temperature for now
      }));

      setConnectedDevices(formattedDevices);
      
      // Set first device as selected if none selected
      if (formattedDevices.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(formattedDevices[0].id);
      }
      
    } catch (error: any) {
      console.error('Error fetching devices:', error);
      
      let errorMessage = "Failed to load devices. Please try again.";
      
      if (error.name === 'DeviceNetworkError') {
        errorMessage = "Cannot connect to device service. Check backend connection.";
      } else if (error.name === 'DeviceEndpointNotFound') {
        errorMessage = "Device API endpoint not found. Check backend configuration.";
      } else if (error.response?.status === 401) {
        errorMessage = "Session expired. Please login again.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Save configuration to InfluxDB (simulate for now)
  const saveConfigurationToInfluxDB = async (deviceSerialNumber: string, configData: { [key: string]: number }) => {
    try {
      // TODO: Implement real API call when backend config endpoints are ready
      // For now, just simulate the save
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, message: 'Configuration saved successfully' };
    } catch (error) {
      console.error('Error saving to InfluxDB:', error);
      throw error;
    }
  };

  // Load configuration from InfluxDB (simulate for now)
  const loadConfigurationFromInfluxDB = async (deviceSerialNumber: string) => {
    try {
      // TODO: Implement real API call when backend config endpoints are ready
      // For now, just return null (use defaults)
      await new Promise(resolve => setTimeout(resolve, 500));
      return null;
    } catch (error) {
      console.error('Error loading from InfluxDB:', error);
      return null;
    }
  };

  // Save configuration with backend integration
  const saveConfiguration = async () => {
    if (!selectedDevice) {
      toast({
        title: "Error",
        description: "No device selected.",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);
      
      // Prepare configuration data (F01-F12 parameters)
      const configData: { [key: string]: number } = {};
      parameters.forEach(param => {
        configData[param.code.toLowerCase()] = param.value;
      });

      // Save to InfluxDB via backend
      await saveConfigurationToInfluxDB(selectedDevice.serialNumber, configData);

      toast({
        title: "Configuration Saved",
        description: `Configuration saved to InfluxDB for ${selectedDevice.name}.`,
      });
      
    } catch (error) {
      console.error('Save configuration error:', error);
      toast({
        title: "Error",
        description: `Failed to save configuration: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Reset to defaults with save option
  const resetToDefaults = async () => {
    setParameters([...defaultParameters]);
    
    toast({
      title: "Reset to Defaults",
      description: "All parameters have been reset to factory defaults. Click Save to apply to device.",
    });
  };

  // Load device configuration when device changes
  const loadDeviceConfiguration = async (deviceSerialNumber: string) => {
    try {
      const configData = await loadConfigurationFromInfluxDB(deviceSerialNumber);
      
      if (configData) {
        // Update parameters with data from InfluxDB
        setParameters(prev => prev.map(param => ({
          ...param,
          value: configData[param.code.toLowerCase()] ?? param.value
        })));
        
        console.log('Configuration loaded from InfluxDB for device:', deviceSerialNumber);
      } else {
        // Use default parameters if no config found
        setParameters([...defaultParameters]);
      }
    } catch (error) {
      console.error('Error loading device configuration:', error);
      // Fallback to defaults on error
      setParameters([...defaultParameters]);
    }
  };

  // Fetch devices on component mount
  useEffect(() => {
    fetchDevices();
  }, []);

  // Load configuration when device changes
  useEffect(() => {
    if (selectedDevice) {
      loadDeviceConfiguration(selectedDevice.serialNumber);
      setCurrentTemp(selectedDevice.temperature);
    }
  }, [selectedDevice]);

  // Cycle simulation (unchanged)
  useEffect(() => {
    if (!autoModeEnabled || !autoModeConfig.cycleEnabled) return;

    const interval = setInterval(() => {
      setCurrentTime(prev => (prev + 1) % 1440);
      
      setCurrentTemp(prev => {
        const targetTemp = cycleStatus.currentMode === 'freezing' 
          ? autoModeConfig.targetTempFreezing 
          : autoModeConfig.targetTempDefrost;
        
        const diff = targetTemp - prev;
        return prev + (diff * 0.1) + (Math.random() - 0.5) * 0.5;
      });
      
      setCycleStatus(prev => {
        const newTimeRemaining = Math.max(0, prev.timeRemaining - 1);
        
        if (newTimeRemaining === 0) {
          const newMode = prev.currentMode === 'freezing' ? 'defrost' : 'freezing';
          const newTotalTime = newMode === 'freezing' ? autoModeConfig.freezingWindowTime : autoModeConfig.defrostWindowTime;
          
          return {
            currentMode: newMode,
            timeRemaining: newTotalTime,
            cycleProgress: 0,
            totalCycleTime: newTotalTime
          };
        }

        const progress = ((prev.totalCycleTime - newTimeRemaining) / prev.totalCycleTime) * 100;
        
        return {
          ...prev,
          timeRemaining: newTimeRemaining,
          cycleProgress: Math.min(100, progress)
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [autoModeEnabled, autoModeConfig.cycleEnabled, autoModeConfig.freezingWindowTime, autoModeConfig.defrostWindowTime, autoModeConfig.targetTempFreezing, autoModeConfig.targetTempDefrost, cycleStatus.currentMode]);

  // Floating header scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const floatingHeader = document.getElementById('floating-header');
      if (floatingHeader) {
        if (window.scrollY > 150) {
          floatingHeader.style.transform = 'translateY(0)';
        } else {
          floatingHeader.style.transform = 'translateY(-100%)';
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Parameter update
  const updateParameter = (id: string, value: number) => {
    setParameters(prev => prev.map(param => 
      param.id === id ? { ...param, value: Math.max(param.min, Math.min(param.max, value)) } : param
    ));
  };

  const updateAutoModeConfig = (field: keyof AutoModeConfig, value: number | boolean) => {
    setAutoModeConfig(prev => ({ ...prev, [field]: value }));
  };

  const startManualDefrost = () => {
    setDefrostActive(true);
    toast({
      title: "Manual Defrost Started",
      description: `Defrost cycle initiated for ${selectedDevice?.name || 'selected device'}.`,
    });
    
    setTimeout(() => {
      setDefrostActive(false);
      toast({
        title: "Defrost Completed",
        description: "Manual defrost cycle has finished.",
      });
    }, 5000);
  };

  const startManualFreezing = () => {
    setFreezeActive(true);
    toast({
      title: "Manual Freezing Started",
      description: `Freezing cycle initiated for ${selectedDevice?.name || 'selected device'}.`,
    });

    setTimeout(() => {
      setFreezeActive(false);
      toast({
        title: "Freezing Completed",
        description: "Manual freezing cycle has finished.",
      });
    }, 5000);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <>
      {/* Initial Header*/}
      <div className="bg-background border-b">
        <div className="mx-auto max-w-8xl p-6">
          <h1 className="text-3xl font-bold text-foreground">System Configuration</h1>
        </div>
      </div>

      {/* Floating Side Menu */}
      <div className="fixed right-0 top-1/2 transform -translate-y-1/2 z-40 transition-all duration-300" id="floating-header">
        <div className="bg-primary shadow-lg rounded-l-lg">
          
          {/* Device Selection */}
          <div className="relative group">
            <div className="w-12 h-12 flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer border-b border-primary-foreground/20">
              <Network className="h-5 w-5" />
            </div>
            <div className="absolute right-12 top-0 w-64 bg-background border border-border rounded-l-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
              <div className="p-4">
                <div className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Network className="h-4 w-4" />
                  Select Device
                </div>
                <select
                  value={selectedDeviceId}
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 text-sm border border-input bg-background rounded-md focus:ring-2 focus:ring-ring focus:border-transparent"
                >
                  {loading ? (
                    <option>Loading devices...</option>
                  ) : connectedDevices.length === 0 ? (
                    <option>No devices found</option>
                  ) : (
                    connectedDevices.map((device) => (
                      <option key={device.id} value={device.id}>
                        {device.name} ({device.serialNumber})
                      </option>
                    ))
                  )}
                </select>
                {selectedDevice && (
                  <div className="mt-3 p-3 bg-muted rounded-md">
                    <div className="flex items-center gap-2 text-sm">
                      <div className={`w-2 h-2 rounded-full ${selectedDevice.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="capitalize font-medium">{selectedDevice.status}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{selectedDevice.productType}</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      📍 {selectedDevice.location}
                    </div>
                    <div className="text-sm font-medium mt-1">
                      🌡️ {selectedDevice.temperature.toFixed(1)}°C
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reset Button */}
          <div className="relative group">
            <div className="w-12 h-12 flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer border-b border-primary-foreground/20">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div className="absolute right-12 top-0 bg-background border border-border rounded-l-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
              <div className="p-4">
                <div className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Reset Configuration
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  This will reset all parameters to factory defaults.
                </p>
                <Button 
                  onClick={resetToDefaults} 
                  variant="outline" 
                  size="sm"
                  className="w-full"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset to Defaults
                </Button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="relative group">
            <div className="w-12 h-12 flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer">
              <Save className="h-5 w-5" />
            </div>
            <div className="absolute right-12 top-0 bg-background border border-border rounded-l-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
              <div className="p-4">
                <div className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Configuration
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Save current settings for {selectedDevice?.name || 'selected device'}.
                </p>
                <Button 
                  onClick={saveConfiguration} 
                  size="sm"
                  className="w-full"
                  disabled={saving || !selectedDevice}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Configuration
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-8xl p-6 space-y-6">

        {/* Current Auto Cycle Status */}
        {autoModeEnabled && autoModeConfig.cycleEnabled && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5" />
                Current Auto Cycle Status
              </CardTitle>
              {/* Device Status Info */}
              {selectedDevice && (
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      selectedDevice.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="capitalize">{selectedDevice.status}</span>
                  </div>
                  <span>•</span>
                  <span>{selectedDevice.productType}</span>
                  <span>•</span>
                  <span>{selectedDevice.location}</span>
                  <span>•</span>
                  <span>Current: {selectedDevice.temperature.toFixed(1)}°C</span>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`h-4 w-4 rounded-full ${
                    cycleStatus.currentMode === 'freezing' ? 'bg-blue-500 animate-pulse' : 
                    cycleStatus.currentMode === 'defrost' ? 'bg-orange-500 animate-pulse' : 'bg-muted'
                  }`}></div>
                  <div>
                    <div className="text-sm text-muted-foreground">Current Mode</div>
                    <div className="font-semibold capitalize">{cycleStatus.currentMode}</div>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Time Remaining</div>
                  <div className="font-semibold">{formatTime(cycleStatus.timeRemaining)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Target Temperature</div>
                  <div className="font-semibold">
                    {cycleStatus.currentMode === 'freezing' 
                      ? `${autoModeConfig.targetTempFreezing}°C` 
                      : `${autoModeConfig.targetTempDefrost}°C`
                    }
                  </div>
                </div>
              </div>
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span>Cycle Progress</span>
                  <span>{cycleStatus.cycleProgress.toFixed(1)}%</span>
                </div>
                <Progress value={cycleStatus.cycleProgress} className="h-2" />
              </div>
              
              {/* 24-Hour Cycle Graph */}
              <div className="space-y-4">
                <CycleGraph
                  freezingTime={autoModeConfig.freezingWindowTime}
                  defrostTime={autoModeConfig.defrostWindowTime}
                  targetTempFreezing={autoModeConfig.targetTempFreezing}
                  targetTempDefrost={autoModeConfig.targetTempDefrost}
                  currentTime={currentTime}
                  currentTemp={currentTemp}
                  currentMode={cycleStatus.currentMode}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Manual Control Buttons */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Manual Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center space-y-2">
                <Button 
                  onClick={startManualDefrost}
                  disabled={defrostActive || selectedDevice?.status === 'offline'}
                  variant={defrostActive ? "secondary" : "default"}
                  className="w-full h-16 text-lg"
                >
                  <Snowflake className="h-6 w-6 mr-3" />
                  {defrostActive ? "Defrost Active..." : "Start Defrost"}
                </Button>
                {defrostActive && (
                  <Badge variant="secondary" className="animate-pulse">
                    Defrosting
                  </Badge>
                )}
                {selectedDevice?.status === 'offline' && (
                  <Badge variant="destructive" className="text-xs">
                    Device Offline
                  </Badge>
                )}
              </div>

              <div className="flex flex-col items-center space-y-2">
                <Button 
                  onClick={startManualFreezing}
                  disabled={freezeActive || selectedDevice?.status === 'offline'}
                  variant={freezeActive ? "secondary" : "default"}
                  className="w-full h-16 text-lg"
                >
                  <Thermometer className="h-6 w-6 mr-3" />
                  {freezeActive ? "Freezing Active..." : "Start Freeze"}
                </Button>
                {freezeActive && (
                  <Badge variant="secondary" className="animate-pulse">
                    Freezing
                  </Badge>
                )}
                {selectedDevice?.status === 'offline' && (
                  <Badge variant="destructive" className="text-xs">
                    Device Offline
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cycle Window Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Cycle Window Configuration
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="cycle-enabled">Enable Auto Cycle</Label>
                <Switch
                  id="cycle-enabled"
                  checked={autoModeConfig.cycleEnabled}
                  onCheckedChange={(checked) => updateAutoModeConfig('cycleEnabled', checked)}
                />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-blue-500" />
                  Freezing Mode Settings
                </h4>
                <div className="space-y-2">
                  <Label htmlFor="freezing-time">Freezing Window Time</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="freezing-time"
                      type="number"
                      value={autoModeConfig.freezingWindowTime}
                      onChange={(e) => updateAutoModeConfig('freezingWindowTime', parseInt(e.target.value) || 0)}
                      min={30}
                      max={1440}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">minutes</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Duration of freezing cycle (30-1440 min)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="freezing-temp">Target Temperature (Freezing)</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="freezing-temp"
                      type="number"
                      value={autoModeConfig.targetTempFreezing}
                      onChange={(e) => updateAutoModeConfig('targetTempFreezing', parseFloat(e.target.value) || 0)}
                      step={0.1}
                      min={-30}
                      max={0}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">°C</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Target temperature during freezing mode</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Snowflake className="h-4 w-4 text-orange-500" />
                  Defrost Mode Settings
                </h4>
                <div className="space-y-2">
                  <Label htmlFor="defrost-time">Defrost Window Time</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="defrost-time"
                      type="number"
                      value={autoModeConfig.defrostWindowTime}
                      onChange={(e) => updateAutoModeConfig('defrostWindowTime', parseInt(e.target.value) || 0)}
                      min={5}
                      max={120}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">minutes</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Duration of defrost cycle (5-120 min)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defrost-temp">Target Temperature (Defrost)</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="defrost-temp"
                      type="number"
                      value={autoModeConfig.targetTempDefrost}
                      onChange={(e) => updateAutoModeConfig('targetTempDefrost', parseFloat(e.target.value) || 0)}
                      step={0.1}
                      min={0}
                      max={20}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">°C</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Target temperature during defrost mode</p>
                </div>
              </div>
            </div>

            {/* Cycle Summary */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h5 className="font-medium mb-2">Cycle Summary</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Cycle Time:</span>
                  <div className="font-medium">
                    {formatTime(autoModeConfig.freezingWindowTime + autoModeConfig.defrostWindowTime)}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Freezing Ratio:</span>
                  <div className="font-medium">
                    {(autoModeConfig.freezingWindowTime / (autoModeConfig.freezingWindowTime + autoModeConfig.defrostWindowTime) * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Daily Cycles:</span>
                  <div className="font-medium">
                    {(1440 / (autoModeConfig.freezingWindowTime + autoModeConfig.defrostWindowTime)).toFixed(1)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Standard Parameters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Standard Parameters (F01-F06)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {parameters.slice(0, 6).map((param) => (
                <div key={param.id} className="space-y-2">
                  <Label htmlFor={param.id} className="text-sm font-medium">
                    {param.code} - {param.name}
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id={param.id}
                      type="number"
                      value={param.value}
                      onChange={(e) => updateParameter(param.id, parseFloat(e.target.value) || 0)}
                      step={param.unit === '°C' ? 0.1 : param.unit === 'min' ? 1 : 0.1}
                      min={param.min}
                      max={param.max}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">{param.unit}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{param.description}</p>
                  <p className="text-xs text-muted-foreground">Range: {param.min} - {param.max} {param.unit}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Defrost Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Defrost Configuration (F07-F12)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {parameters.slice(6).map((param) => (
                <div key={param.id} className="space-y-2">
                  <Label htmlFor={param.id} className="text-sm font-medium">
                    {param.code} - {param.name}
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id={param.id}
                      type="number"
                      value={param.value}
                      onChange={(e) => updateParameter(param.id, parseFloat(e.target.value) || 0)}
                      step={param.unit === '°C' ? 0.1 : param.unit === 'min' ? 1 : param.unit === 'sec' ? 1 : 0.1}
                      min={param.min}
                      max={param.max}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">{param.unit}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{param.description}</p>
                  <p className="text-xs text-muted-foreground">Range: {param.min} - {param.max} {param.unit}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Configuration Status */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Selected Device</div>
                <div className="text-lg font-semibold">
                  {selectedDevice ? selectedDevice.name : 'No device selected'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedDevice ? `Serial: ${selectedDevice.serialNumber}` : ''}
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Configuration Source</div>
                <div className="text-lg font-semibold">InfluxDB</div>
                <div className="text-sm text-muted-foreground">
                  {selectedDevice ? 'Auto-loaded from device' : 'Using defaults'}
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Last Action</div>
                <div className="text-lg font-semibold">
                  {saving ? 'Saving...' : 'Ready'}
                </div>
                <div className="text-sm text-muted-foreground">
                  Click Save to apply changes
                </div>
              </div>
            </div>
            
            {/* Configuration Info */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h5 className="font-medium mb-2 text-blue-800">Configuration Info</h5>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• Parameters F01-F12 will be saved to InfluxDB with device serial number as filter</p>
                <p>• Configuration is automatically loaded when switching devices</p>
                <p>• Reset to Defaults will restore factory settings (save required to apply)</p>
                <p>• All changes are stored in measurement format: {`{device_serial}_field`}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        </div>
      </div>
    </>
  );
};

export default Configuration;