import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Settings, Snowflake, RotateCcw, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

const Configuration = () => {
  const { toast } = useToast();
  const [mode, setMode] = useState<'auto' | 'defrost'>('auto');
  const [autoModeEnabled, setAutoModeEnabled] = useState(true);
  const [defrostActive, setDefrostActive] = useState(false);

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

  const updateParameter = (id: string, value: number) => {
    setParameters(prev => prev.map(param => 
      param.id === id ? { ...param, value: Math.max(param.min, Math.min(param.max, value)) } : param
    ));
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

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">System Configuration</h1>
          <div className="flex gap-2">
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Auto Mode Settings
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