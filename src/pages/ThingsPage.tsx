import React, { useState } from 'react';
import { Network, Edit2, Trash2, Plus, Package, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

// Type definitions
interface IoTDevice {
  id: string;
  name: string;
  type: string;
  image: string;
  status: 'online' | 'offline';
  connectedAt: Date;
}

const ThingsPage: React.FC = () => {
  const { toast } = useToast();
  
  // State management
  const [devices, setDevices] = useState<IoTDevice[]>([
    {
      id: "FRZ001",
      name: "Main Freezer Unit A",
      type: "Industrial Freezer",
      image: "/api/placeholder/80/80",
      status: 'online',
      connectedAt: new Date('2024-01-15')
    },
    {
      id: "FRZ002", 
      name: "Backup Freezer Unit B",
      type: "Commercial Freezer",
      image: "/api/placeholder/80/80",
      status: 'online',
      connectedAt: new Date('2024-01-20')
    },
    {
      id: "THM001",
      name: "Temperature Monitor 1",
      type: "Temperature Sensor",
      image: "/api/placeholder/80/80", 
      status: 'offline',
      connectedAt: new Date('2024-02-01')
    }
  ]);
  
  const [newDeviceId, setNewDeviceId] = useState('');
  const [editingDevice, setEditingDevice] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  // Add new device function
  const handleAddDevice = () => {
    if (!newDeviceId.trim()) {
      toast({
        title: "Error",
        description: "Device ID tidak boleh kosong",
        variant: "destructive"
      });
      return;
    }

    // Check for duplicate ID
    const isDuplicate = devices.some(device => 
      device.id.toLowerCase() === newDeviceId.trim().toLowerCase()
    );

    if (isDuplicate) {
      toast({
        title: "Error", 
        description: "Device ID sudah terdaftar. Gunakan ID yang berbeda.",
        variant: "destructive"
      });
      return;
    }

    // Create new device
    const newDevice: IoTDevice = {
      id: newDeviceId.trim(),
      name: `New Device ${newDeviceId}`,
      type: "Unknown Device",
      image: "/api/placeholder/80/80",
      status: 'offline',
      connectedAt: new Date()
    };

    setDevices([...devices, newDevice]);
    setNewDeviceId('');
    
    toast({
      title: "Success",
      description: `Device ${newDeviceId} berhasil ditambahkan`,
    });
  };

  // Edit device name
  const startEdit = (device: IoTDevice) => {
    setEditingDevice(device.id);
    setEditName(device.name);
  };

  const saveEdit = () => {
    if (!editName.trim()) {
      toast({
        title: "Error",
        description: "Nama device tidak boleh kosong",
        variant: "destructive"
      });
      return;
    }

    setDevices(devices.map(device => 
      device.id === editingDevice 
        ? { ...device, name: editName.trim() }
        : device
    ));
    
    setEditingDevice(null);
    setEditName('');
    
    toast({
      title: "Success", 
      description: "Nama device berhasil diupdate",
    });
  };

  const cancelEdit = () => {
    setEditingDevice(null);
    setEditName('');
  };

  // Delete device
  const handleDeleteDevice = (deviceId: string) => {
    setDevices(devices.filter(device => device.id !== deviceId));
    toast({
      title: "Success",
      description: "Device berhasil dihapus",
    });
  };

  // Handle enter key for adding device
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddDevice();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Network className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Things</h1>
        <Badge variant="outline" className="ml-auto">
          {devices.length} Connected Devices
        </Badge>
      </div>

      {/* Add Device Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Device
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter Device ID (e.g., FRZ003)"
              value={newDeviceId}
              onChange={(e) => setNewDeviceId(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={handleAddDevice} className="px-6">
              Submit
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Devices List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Connected Devices
          </CardTitle>
        </CardHeader>
        <CardContent>
          {devices.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Belum ada device yang terhubung</p>
            </div>
          ) : (
            <div className="space-y-4">
              {devices.map((device) => (
                <div 
                  key={device.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {/* Device Image */}
                  <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>

                  {/* Device Info */}
                  <div className="flex-1 min-w-0">
                    {editingDevice === device.id ? (
                      <div className="space-y-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="font-medium"
                          onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                        />
                        <p className="text-sm text-muted-foreground">{device.type}</p>
                      </div>
                    ) : (
                      <div>
                        <h3 className="font-medium truncate">{device.name}</h3>
                        <p className="text-sm text-muted-foreground">{device.type}</p>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 mt-2">
                      <Badge 
                        variant={device.status === 'online' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {device.status === 'online' ? '🟢' : '🔴'} {device.status.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        ID: {device.id}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Connected: {device.connectedAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {editingDevice === device.id ? (
                      <>
                        <Button
                          size="sm"
                          onClick={saveEdit}
                          className="h-8 w-8 p-0"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEdit}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEdit(device)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteDevice(device.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Devices</p>
                <p className="text-2xl font-bold">{devices.length}</p>
              </div>
              <Network className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Online</p>
                <p className="text-2xl font-bold text-green-600">
                  {devices.filter(d => d.status === 'online').length}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-green-500"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Offline</p>
                <p className="text-2xl font-bold text-red-600">
                  {devices.filter(d => d.status === 'offline').length}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-red-500"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ThingsPage;