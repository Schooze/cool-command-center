import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar, Download, Filter, FileText, FileSpreadsheet, Clock, Thermometer, DoorClosed, Users, Settings, Database, Activity, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const AuditDataLogging = () => {
  // Mock data
  const temperatureData = [
    { time: '00:00', temperature: -18.5, humidity: 65 },
    { time: '02:00', temperature: -18.2, humidity: 66 },
    { time: '04:00', temperature: -18.8, humidity: 64 },
    { time: '06:00', temperature: -18.1, humidity: 67 },
    { time: '08:00', temperature: -17.9, humidity: 68 },
    { time: '10:00', temperature: -18.3, humidity: 65 },
    { time: '12:00', temperature: -18.6, humidity: 63 },
    { time: '14:00', temperature: -18.4, humidity: 64 },
    { time: '16:00', temperature: -18.1, humidity: 66 },
    { time: '18:00', temperature: -18.7, humidity: 62 },
    { time: '20:00', temperature: -18.5, humidity: 65 },
    { time: '22:00', temperature: -18.3, humidity: 66 }
  ];

  const setpointLogs = [
    { timestamp: '2024-08-06 14:30:00', user: 'operator1', old_setpoint: -18, new_setpoint: -20, chamber: 'Chamber A' },
    { timestamp: '2024-08-06 10:15:00', user: 'admin', old_setpoint: -20, new_setpoint: -18, chamber: 'Chamber B' },
    { timestamp: '2024-08-05 16:45:00', user: 'operator2', old_setpoint: -18, new_setpoint: -19, chamber: 'Chamber A' },
    { timestamp: '2024-08-05 09:20:00', user: 'operator1', old_setpoint: -19, new_setpoint: -18, chamber: 'Chamber C' }
  ];

  const alarmData = [
    { alarm_type: 'High Temperature', trigger_time: '2024-08-06 15:30:00', resolved_time: '2024-08-06 15:35:00', acknowledged_by: 'operator1', chamber: 'Chamber A' },
    { alarm_type: 'Door Open', trigger_time: '2024-08-06 12:15:00', resolved_time: '2024-08-06 12:17:00', acknowledged_by: 'operator2', chamber: 'Chamber B' },
    { alarm_type: 'Low Temperature', trigger_time: '2024-08-06 08:45:00', resolved_time: '2024-08-06 08:50:00', acknowledged_by: 'admin', chamber: 'Chamber C' },
    { alarm_type: 'Power Failure', trigger_time: '2024-08-05 20:30:00', resolved_time: '2024-08-05 20:35:00', acknowledged_by: 'operator1', chamber: 'All' }
  ];

  const alarmFrequency = [
    { type: 'High Temp', count: 15 },
    { type: 'Door Open', count: 8 },
    { type: 'Low Temp', count: 5 },
    { type: 'Power Failure', count: 2 },
    { type: 'Sensor Error', count: 3 }
  ];

  const doorOpenData = [
    { hour: '06:00', count: 3 },
    { hour: '07:00', count: 5 },
    { hour: '08:00', count: 8 },
    { hour: '09:00', count: 12 },
    { hour: '10:00', count: 15 },
    { hour: '11:00', count: 10 },
    { hour: '12:00', count: 7 },
    { hour: '13:00', count: 9 },
    { hour: '14:00', count: 11 },
    { hour: '15:00', count: 6 },
    { hour: '16:00', count: 4 },
    { hour: '17:00', count: 2 }
  ];

  const doorLogs = [
    { door_id: 'Door-01', open_time: '14:30:15', close_time: '14:32:20', duration: '2m 5s', user: 'operator1' },
    { door_id: 'Door-02', open_time: '12:15:30', close_time: '12:16:45', duration: '1m 15s', user: 'operator2' },
    { door_id: 'Door-01', open_time: '10:45:00', close_time: '10:47:30', duration: '2m 30s', user: 'admin' },
    { door_id: 'Door-03', open_time: '09:20:15', close_time: '09:21:00', duration: '45s', user: 'operator1' }
  ];

  const userActivityLogs = [
    { timestamp: '2024-08-06 14:30:00', user_id: 'operator1', action: 'Change Setpoint', target: 'Chamber A', status: 'Success' },
    { timestamp: '2024-08-06 12:15:00', user_id: 'operator2', action: 'Open Door', target: 'Door-02', status: 'Success' },
    { timestamp: '2024-08-06 10:45:00', user_id: 'admin', action: 'System Backup', target: 'Database', status: 'Success' },
    { timestamp: '2024-08-06 09:20:00', user_id: 'operator1', action: 'Acknowledge Alarm', target: 'Chamber C', status: 'Success' }
  ];

  const equipmentStatus = [
    { time: '00:00', compressor: 1, fan: 1, defrost: 0 },
    { time: '01:00', compressor: 1, fan: 1, defrost: 0 },
    { time: '02:00', compressor: 0, fan: 0, defrost: 1 },
    { time: '03:00', compressor: 0, fan: 0, defrost: 1 },
    { time: '04:00', compressor: 1, fan: 1, defrost: 0 },
    { time: '05:00', compressor: 1, fan: 1, defrost: 0 },
    { time: '06:00', compressor: 1, fan: 1, defrost: 0 },
    { time: '07:00', compressor: 1, fan: 1, defrost: 0 },
    { time: '08:00', compressor: 0, fan: 0, defrost: 1 },
    { time: '09:00', compressor: 0, fan: 0, defrost: 1 },
    { time: '10:00', compressor: 1, fan: 1, defrost: 0 },
    { time: '11:00', compressor: 1, fan: 1, defrost: 0 }
  ];

  const backupLogs = [
    { backup_time: '2024-08-06 02:00:00', status: true, file_name: 'backup_20240806_020000.sql', file_size: '25.4 MB', checksum: 'a1b2c3d4' },
    { backup_time: '2024-08-05 02:00:00', status: true, file_name: 'backup_20240805_020000.sql', file_size: '24.8 MB', checksum: 'e5f6g7h8' },
    { backup_time: '2024-08-04 02:00:00', status: false, file_name: 'backup_20240804_020000.sql', file_size: '0 MB', checksum: 'failed' },
    { backup_time: '2024-08-03 02:00:00', status: true, file_name: 'backup_20240803_020000.sql', file_size: '23.9 MB', checksum: 'i9j0k1l2' }
  ];

  // State for filters
  const [dateFilter, setDateFilter] = useState('today');
  const [userFilter, setUserFilter] = useState('all');
  const [chamberFilter, setChamberFilter] = useState('all');

  // Heatmap data (mock calendar data)
  const generateHeatmapData = () => {
    const data = [];
    for (let day = 1; day <= 31; day++) {
      const temp = -18 + (Math.random() - 0.5) * 6; // Random temp between -21 and -15
      let status = 'normal';
      if (temp > -16) status = 'high';
      else if (temp < -20) status = 'low';
      
      data.push({
        day,
        temperature: temp.toFixed(1),
        status
      });
    }
    return data;
  };

  const heatmapData = generateHeatmapData();

  const exportData = (format: string) => {
    console.log(`Exporting data in ${format} format`);
    // Implementation for actual export would go here
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'high': return 'bg-red-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header and Global Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Audit & Data Logging
          </h1>
          <p className="text-muted-foreground mt-1">Comprehensive system monitoring and data analysis</p>
        </div>
        
        {/* Global Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="User" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="operator1">Operator 1</SelectItem>
              <SelectItem value="operator2">Operator 2</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={chamberFilter} onValueChange={setChamberFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Chamber" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Chambers</SelectItem>
              <SelectItem value="chamber-a">Chamber A</SelectItem>
              <SelectItem value="chamber-b">Chamber B</SelectItem>
              <SelectItem value="chamber-c">Chamber C</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Export Buttons */}
          <div className="flex gap-2">
            <Button onClick={() => exportData('pdf')} size="sm" variant="outline">
              <FileText className="h-4 w-4 mr-1" />
              PDF
            </Button>
            <Button onClick={() => exportData('csv')} size="sm" variant="outline">
              <FileSpreadsheet className="h-4 w-4 mr-1" />
              CSV
            </Button>
            <Button onClick={() => exportData('xlsx')} size="sm" variant="outline">
              <Download className="h-4 w-4 mr-1" />
              XLSX
            </Button>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* A: Daily Temperature Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="h-5 w-5" />
              Grafik Suhu Harian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={temperatureData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="temperature" stroke="#2563eb" strokeWidth={2} name="Temperature (°C)" />
                  <Line type="monotone" dataKey="humidity" stroke="#16a34a" strokeWidth={2} name="Humidity (%)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* Temperature Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Timestamp</th>
                    <th className="text-left p-2">Temperature (°C)</th>
                    <th className="text-left p-2">Humidity (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {temperatureData.slice(0, 5).map((data, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{data.time}</td>
                      <td className="p-2">{data.temperature}</td>
                      <td className="p-2">{data.humidity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* C: Alarm List with Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Daftar Alarm
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Alarm Frequency Chart */}
            <div className="h-32 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={alarmFrequency}>
                  <XAxis dataKey="type" fontSize={10} />
                  <YAxis fontSize={10} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Alarm Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Trigger</th>
                    <th className="text-left p-2">Resolved</th>
                    <th className="text-left p-2">By</th>
                  </tr>
                </thead>
                <tbody>
                  {alarmData.slice(0, 3).map((alarm, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">
                        <Badge variant="destructive" className="text-xs">{alarm.alarm_type}</Badge>
                      </td>
                      <td className="p-2 text-xs">{alarm.trigger_time.split(' ')[1]}</td>
                      <td className="p-2 text-xs">{alarm.resolved_time.split(' ')[1]}</td>
                      <td className="p-2 text-xs">{alarm.acknowledged_by}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* B: Setpoint Change History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Riwayat Perubahan Setpoint
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Timestamp</th>
                    <th className="text-left p-2">User</th>
                    <th className="text-left p-2">Old</th>
                    <th className="text-left p-2">New</th>
                    <th className="text-left p-2">Chamber</th>
                  </tr>
                </thead>
                <tbody>
                  {setpointLogs.map((log, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2 text-xs">{log.timestamp}</td>
                      <td className="p-2">
                        <Badge variant="secondary">{log.user}</Badge>
                      </td>
                      <td className="p-2">{log.old_setpoint}°C</td>
                      <td className="p-2">{log.new_setpoint}°C</td>
                      <td className="p-2">{log.chamber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* D: Door Open Log */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DoorClosed className="h-5 w-5" />
              Door Open Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Door Open Histogram */}
            <div className="h-32 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={doorOpenData}>
                  <XAxis dataKey="hour" fontSize={10} />
                  <YAxis fontSize={10} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Door Logs Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Door ID</th>
                    <th className="text-left p-2">Open</th>
                    <th className="text-left p-2">Close</th>
                    <th className="text-left p-2">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {doorLogs.slice(0, 3).map((log, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">
                        <Badge variant="outline">{log.door_id}</Badge>
                      </td>
                      <td className="p-2 text-xs">{log.open_time}</td>
                      <td className="p-2 text-xs">{log.close_time}</td>
                      <td className="p-2 text-xs">{log.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* E: User Activity Log */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Log Aktivitas User
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Timestamp</th>
                    <th className="text-left p-2">User</th>
                    <th className="text-left p-2">Action</th>
                    <th className="text-left p-2">Target</th>
                    <th className="text-left p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {userActivityLogs.map((log, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2 text-xs">{log.timestamp.split(' ')[1]}</td>
                      <td className="p-2">
                        <Badge variant="secondary" className="text-xs">{log.user_id}</Badge>
                      </td>
                      <td className="p-2 text-xs">{log.action}</td>
                      <td className="p-2 text-xs">{log.target}</td>
                      <td className="p-2">
                        <Badge variant="default" className="text-xs bg-green-500">
                          {log.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* F: Equipment Status Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Status Kompresor dan Kipas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Equipment Status Bars */}
              <div>
                <div className="text-sm font-medium mb-1">Kompresor</div>
                <div className="flex gap-1 h-6">
                  {equipmentStatus.map((status, index) => (
                    <div
                      key={index}
                      className={`flex-1 rounded-sm ${status.compressor ? 'bg-green-500' : 'bg-red-500'}`}
                      title={`${status.time}: ${status.compressor ? 'ON' : 'OFF'}`}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium mb-1">Kipas</div>
                <div className="flex gap-1 h-6">
                  {equipmentStatus.map((status, index) => (
                    <div
                      key={index}
                      className={`flex-1 rounded-sm ${status.fan ? 'bg-green-500' : 'bg-red-500'}`}
                      title={`${status.time}: ${status.fan ? 'ON' : 'OFF'}`}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium mb-1">Defrost</div>
                <div className="flex gap-1 h-6">
                  {equipmentStatus.map((status, index) => (
                    <div
                      key={index}
                      className={`flex-1 rounded-sm ${status.defrost ? 'bg-green-500' : 'bg-red-500'}`}
                      title={`${status.time}: ${status.defrost ? 'ON' : 'OFF'}`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* G: Backup Data Log */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Log Backup Data
              </div>
              <Button size="sm" variant="outline">
                <Clock className="h-4 w-4 mr-1" />
                Cek Backup Terakhir
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Backup Time</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">File Size</th>
                    <th className="text-left p-2">Checksum</th>
                  </tr>
                </thead>
                <tbody>
                  {backupLogs.map((log, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2 text-xs">{log.backup_time}</td>
                      <td className="p-2">
                        {log.status ? (
                          <span className="text-green-600 font-bold">✔️</span>
                        ) : (
                          <span className="text-red-600 font-bold">❌</span>
                        )}
                      </td>
                      <td className="p-2 text-xs">{log.file_size}</td>
                      <td className="p-2 text-xs font-mono">{log.checksum}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* I: Temperature Deviation Heatmap */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="h-5 w-5" />
              Heatmap Suhu Menyimpang (Agustus 2024)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="text-center text-xs font-medium p-2">{day}</div>
              ))}
              
              {heatmapData.map((data, index) => (
                <div
                  key={index}
                  className={`aspect-square flex items-center justify-center text-xs font-medium text-white rounded cursor-pointer ${getStatusColor(data.status)}`}
                  title={`Day ${data.day}: ${data.temperature}°C - ${data.status}`}
                >
                  {data.day}
                </div>
              ))}
            </div>
            
            {/* Legend */}
            <div className="flex justify-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Terlalu Rendah (&lt; -20°C)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Normal (-20°C to -16°C)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Terlalu Tinggi (&gt; -16°C)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuditDataLogging;