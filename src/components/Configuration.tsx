import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Settings, Snowflake, LayoutDashboard, RotateCcw, Save, Clock, Thermometer, Timer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import CycleGraph from './CycleGraph';

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
  freezingWindowTime: number; // minutes
  defrostWindowTime: number; // minutes
  targetTempFreezing: number; // °C
  targetTempDefrost: number; // °C
  cycleEnabled: boolean;
}

interface CycleStatus {
  currentMode: 'freezing' | 'defrost' | 'idle';
  timeRemaining: number; // minutes
  cycleProgress: number; // percentage
  totalCycleTime: number; // minutes
}

const Configuration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mode, setMode] = useState<'auto' | 'defrost'>('auto');
  const [autoModeEnabled, setAutoModeEnabled] = useState(true);
  const [defrostActive, setDefrostActive] = useState(false);

  // Auto mode cycle configuration
  const [autoModeConfig, setAutoModeConfig] = useState<AutoModeConfig>({
    freezingWindowTime: 240, // 4 hours
    defrostWindowTime: 30,   // 30 minutes
    targetTempFreezing: -18.0,
    targetTempDefrost: 8.0,
    cycleEnabled: true
  });

  // Current cycle status simulation
  const [cycleStatus, setCycleStatus] = useState<CycleStatus>({
    currentMode: 'freezing',
    timeRemaining: 180, // 3 hours remaining in freezing
    cycleProgress: 25,  // 25% through current cycle
    totalCycleTime: 270 // total cycle time (freezing + defrost)
  });

  // Simulate current temperature and time
  const [currentTemp, setCurrentTemp] = useState(-16.5);
  const [currentTime, setCurrentTime] = useState(420); // 7:00 AM (420 minutes from 6:00 AM)

  const [parameters, setParameters] = useState<Parameter[]>([
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
  ]);

  // Simulate cycle progress and temperature
  useEffect(() => {
    if (!autoModeEnabled || !autoModeConfig.cycleEnabled) return;

    const interval = setInterval(() => {
      // Update time (every minute for demo)
      setCurrentTime(prev => (prev + 1) % 1440); // Reset every 24 hours
      
      // Simulate temperature changes based on mode
      setCurrentTemp(prev => {
        const targetTemp = cycleStatus.currentMode === 'freezing' 
          ? autoModeConfig.targetTempFreezing 
          : autoModeConfig.targetTempDefrost;
        
        // Gradually move towards target temperature
        const diff = targetTemp - prev;
        return prev + (diff * 0.1) + (Math.random() - 0.5) * 0.5;
      });
      
      setCycleStatus(prev => {
        const newTimeRemaining = Math.max(0, prev.timeRemaining - 1);
        
        if (newTimeRemaining === 0) {
          // Switch modes when time runs out
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
    }, 2000); // Update every 2 seconds for demo (in real system would be actual time)

    return () => clearInterval(interval);
  }, [autoModeEnabled, autoModeConfig.cycleEnabled, autoModeConfig.freezingWindowTime, autoModeConfig.defrostWindowTime, autoModeConfig.targetTempFreezing, autoModeConfig.targetTempDefrost, cycleStatus.currentMode]);

  const updateParameter = (id: string, value: number) => {
    setParameters(prev => prev.map(param => 
      param.id === id ? { ...param, value: Math.max(param.min, Math.min(param.max, value)) } : param
    ));
  };

  const updateAutoModeConfig = (field: keyof AutoModeConfig, value: number | boolean) => {
    setAutoModeConfig(prev => ({ ...prev, [field]: value }));
  };

  const saveConfiguration = () => {
    toast({
      title: "Configuration Saved",
      description: "All parameters have been updated successfully.",
    });
  };

  const resetToDefaults = () => {
    toast({
      title: "Reset to Defaults",
      description: "All parameters have been reset to factory defaults.",
    });
  };
  const backToDashboard = () => {
    navigate('/'); // or whatever your dashboard route is
  }
  const startManualDefrost = () => {
    setDefrostActive(true);
    toast({
      title: "Manual Defrost Started",
      description: "Defrost cycle has been initiated manually.",
    });
    
    // Simulate defrost completion after 5 seconds for demo
    setTimeout(() => {
      setDefrostActive(false);
      toast({
        title: "Defrost Completed",
        description: "Manual defrost cycle has finished.",
      });
    }, 5000);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">System Configuration</h1>
          <div className="flex gap-2">
            <Button onClick={backToDashboard} variant="outline">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button onClick={resetToDefaults} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Defaults
            </Button>
            <Button onClick={saveConfiguration}>
              <Save className="h-4 w-4 mr-2" />
              Save Configuration
            </Button>
          </div>
        </div>

        <Tabs value={mode} onValueChange={(value) => setMode(value as 'auto' | 'defrost')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="auto" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Auto Mode Configuration
            </TabsTrigger>
            <TabsTrigger value="defrost" className="flex items-center gap-2">
              <Snowflake className="h-4 w-4" />
              Defrost Mode Configuration
            </TabsTrigger>
          </TabsList>

          <TabsContent value="auto" className="space-y-6">
            {/* Cycle Status Display */}
            {autoModeEnabled && autoModeConfig.cycleEnabled && (
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Timer className="h-5 w-5" />
                    Current Auto Cycle Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center space-x-3">
                      <div className={`h-4 w-4 rounded-full ${
                        cycleStatus.currentMode === 'freezing' ? 'bg-info animate-pulse' : 
                        cycleStatus.currentMode === 'defrost' ? 'bg-warning animate-pulse' : 'bg-muted'
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
                  <CycleGraph
                    freezingTime={autoModeConfig.freezingWindowTime}
                    defrostTime={autoModeConfig.defrostWindowTime}
                    targetTempFreezing={autoModeConfig.targetTempFreezing}
                    targetTempDefrost={autoModeConfig.targetTempDefrost}
                    currentTime={currentTime}
                    currentTemp={currentTemp}
                    currentMode={cycleStatus.currentMode}
                  />
                </CardContent>
              </Card>
            )}

            {/* Auto Mode Cycle Configuration */}
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
                      <Thermometer className="h-4 w-4 text-info" />
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
                      <Snowflake className="h-4 w-4 text-warning" />
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
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Standard Parameters
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="auto-mode">Auto Mode</Label>
                    <Switch
                      id="auto-mode"
                      checked={autoModeEnabled}
                      onCheckedChange={setAutoModeEnabled}
                    />
                    <Badge variant={autoModeEnabled ? "default" : "secondary"}>
                      {autoModeEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
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
          </TabsContent>

          <TabsContent value="defrost" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Defrost Configuration
                  <div className="flex items-center space-x-2">
                    <Button 
                      onClick={startManualDefrost}
                      disabled={defrostActive}
                      variant={defrostActive ? "secondary" : "default"}
                    >
                      <Snowflake className="h-4 w-4 mr-2" />
                      {defrostActive ? "Defrost Active..." : "Start Manual Defrost"}
                    </Button>
                    {defrostActive && (
                      <Badge variant="secondary" className="animate-pulse">
                        Defrosting
                      </Badge>
                    )}
                  </div>
                </CardTitle>
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

            <Card>
              <CardHeader>
                <CardTitle>Defrost Status Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Last Defrost</div>
                    <div className="text-lg font-semibold">2 hours ago</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Next Scheduled</div>
                    <div className="text-lg font-semibold">4 hours</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Defrost Cycles Today</div>
                    <div className="text-lg font-semibold">3</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Configuration;