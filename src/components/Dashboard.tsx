import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Thermometer, Droplets, Gauge, Zap, Power, Activity } from 'lucide-react';
import TemperatureHistoryGraph from './TemperatureHistoryGraph';

interface SensorData {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'alarm' | 'offline';
  min?: number;
  max?: number;
}

interface DigitalStatus {
  id: string;
  name: string;
  active: boolean;
  type: 'input' | 'output';
}

const Dashboard = () => {
  const [temperatureSensors, setTemperatureSensors] = useState<SensorData[]>([
    { id: 'ntc1', name: 'Evaporator Temp', value: -18.5, unit: '°C', status: 'normal', min: -25, max: -15 },
    { id: 'ntc2', name: 'Product Temp', value: -16.2, unit: '°C', status: 'normal', min: -20, max: -10 },
    { id: 'ntc3', name: 'Ambient Temp', value: 22.1, unit: '°C', status: 'normal', min: 15, max: 35 },
    { id: 'ntc4', name: 'Condenser Temp', value: 45.3, unit: '°C', status: 'warning', min: 30, max: 60 },
  ]);

  const [otherSensors, setOtherSensors] = useState<SensorData[]>([
    { id: 'digital', name: 'Digital Sensor', value: 1, unit: '', status: 'normal' },
    { id: 'humidity', name: 'Humidity', value: 65.2, unit: '%', status: 'normal', min: 40, max: 80 },
    { id: 'pressure', name: 'Pressure', value: 1013.2, unit: 'hPa', status: 'normal', min: 950, max: 1050 },
  ]);

  const [electrical, setElectrical] = useState<SensorData[]>([
    { id: 'current', name: 'Current', value: 8.5, unit: 'A', status: 'normal', min: 0, max: 15 },
    { id: 'voltage', name: 'Voltage', value: 230.2, unit: 'V', status: 'normal', min: 200, max: 250 },
  ]);

  const [digitalInputs, setDigitalInputs] = useState<DigitalStatus[]>([
    { id: 'di1', name: 'Door Switch', active: false, type: 'input' },
    { id: 'di2', name: 'Emergency Stop', active: false, type: 'input' },
    { id: 'di3', name: 'High Pressure', active: false, type: 'input' },
  ]);

  const [digitalOutputs, setDigitalOutputs] = useState<DigitalStatus[]>([
    { id: 'do1', name: 'Compressor', active: true, type: 'output' },
    { id: 'do2', name: 'Fan 1', active: true, type: 'output' },
    { id: 'do3', name: 'Fan 2', active: false, type: 'output' },
    { id: 'do4', name: 'Defrost Heater', active: false, type: 'output' },
    { id: 'do5', name: 'Alarm', active: false, type: 'output' },
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTemperatureSensors(prev => prev.map(sensor => ({
        ...sensor,
        value: sensor.value + (Math.random() - 0.5) * 0.2,
        status: sensor.value > (sensor.max || 100) || sensor.value < (sensor.min || -100) ? 'alarm' : 
               Math.abs(sensor.value - ((sensor.max || 0) + (sensor.min || 0)) / 2) > ((sensor.max || 0) - (sensor.min || 0)) * 0.3 ? 'warning' : 'normal'
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-sensor-normal';
      case 'warning': return 'bg-sensor-warning';
      case 'alarm': return 'bg-sensor-alarm';
      case 'offline': return 'bg-sensor-offline';
      default: return 'bg-muted';
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      normal: 'bg-success text-success-foreground',
      warning: 'bg-warning text-warning-foreground',
      alarm: 'bg-critical text-critical-foreground',
      offline: 'bg-muted text-muted-foreground'
    };
    return colors[status as keyof typeof colors] || colors.offline;
  };
  
  const [historicalTemps, setHistoricalTemps] = useState<{ time: Date; value: number }[]>([]);

  // Simulate collecting historical data
  useEffect(() => {
    // Initialize with some data
    const initialData = [];
    const now = new Date();
    
    // Generate data for the last 24 hours
    for (let i = 24; i >= 0; i--) {
      const time = new Date(now);
      time.setHours(now.getHours() - i);
      
      // Simulate temperature fluctuations
      const baseTemp = -18;
      const fluctuation = Math.sin(i * Math.PI / 12) * 5; // Daily cycle
      const randomVariation = (Math.random() - 0.5) * 2; // Small random changes
      
      initialData.push({
        time,
        value: baseTemp + fluctuation + randomVariation
      });
    }
    
    setHistoricalTemps(initialData);

    // Update with new data periodically
    const interval = setInterval(() => {
      setHistoricalTemps(prev => {
        const newData = [...prev];
        const now = new Date();
        
        // Remove data older than 24 hours
        while (newData.length > 0 && now.getTime() - newData[0].time.getTime() > 24 * 60 * 60 * 1000) {
          newData.shift();
        }
        
        // Add new data point
        const baseTemp = -18;
        const hours = now.getHours();
        const fluctuation = Math.sin(hours * Math.PI / 12) * 5;
        const randomVariation = (Math.random() - 0.5) * 2;
        
        newData.push({
          time: now,
          value: baseTemp + fluctuation + randomVariation
        });
        
        return newData;
      });
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Cooling Room Controller</h1>
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-success animate-pulse"></div>
            <span className="text-sm text-muted-foreground">System Online</span>
          </div>
        </div>

        {/* Temperature Sensors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="h-5 w-5" />
              Temperature Sensors (NTC)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {temperatureSensors.map((sensor) => (
                <div key={sensor.id} className="flex flex-col space-y-2 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{sensor.name}</span>
                    <Badge className={getStatusBadge(sensor.status)}>{sensor.status}</Badge>
                  </div>
                  <div className="text-2xl font-bold">{sensor.value.toFixed(1)}{sensor.unit}</div>
                  {sensor.min !== undefined && sensor.max !== undefined && (
                    <div className="text-xs text-muted-foreground">
                      Range: {sensor.min}°C to {sensor.max}°C
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Other Sensors */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Environmental
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {otherSensors.map((sensor) => (
                <div key={sensor.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">{sensor.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {sensor.min !== undefined && sensor.max !== undefined && 
                        `${sensor.min}-${sensor.max}${sensor.unit}`
                      }
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{sensor.value.toFixed(1)}{sensor.unit}</div>
                    <Badge className={getStatusBadge(sensor.status)} variant="outline">{sensor.status}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Electrical
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {electrical.map((sensor) => (
                <div key={sensor.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">{sensor.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {sensor.min}-{sensor.max}{sensor.unit}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{sensor.value.toFixed(1)}{sensor.unit}</div>
                    <Badge className={getStatusBadge(sensor.status)} variant="outline">{sensor.status}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Power className="h-5 w-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Digital Inputs</h4>
                <div className="space-y-2">
                  {digitalInputs.map((input) => (
                    <div key={input.id} className="flex items-center justify-between">
                      <span className="text-sm">{input.name}</span>
                      <div className={`h-3 w-3 rounded-full ${input.active ? 'bg-status-active' : 'bg-status-inactive'}`}></div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Digital Outputs</h4>
                <div className="space-y-2">
                  {digitalOutputs.map((output) => (
                    <div key={output.id} className="flex items-center justify-between">
                      <span className="text-sm">{output.name}</span>
                      <div className={`h-3 w-3 rounded-full ${output.active ? 'bg-status-active' : 'bg-status-inactive'}`}></div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
         <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="h-5 w-5" />
              Evaporator Temperature History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TemperatureHistoryGraph 
              temperatures={historicalTemps}
              minTemp={-30}
              maxTemp={10}
              unit="°C"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
