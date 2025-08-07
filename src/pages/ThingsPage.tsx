import React, { useState } from 'react';
import { Network, Edit2, Trash2, Plus, Package, Check, X, QrCode } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import QRScannerModal from '@/components/QRScannerModal';

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
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // Device Management Functions
  const handleAddDevice = () => {
    if (!newDeviceId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a Device ID",
        variant: "destructive"
      });
      return;
    }

    // Check if device already exists
    const existingDevice = devices.find(d => d.id === newDeviceId);
    if (existingDevice) {
      toast({
        title: "Device Already Exists",
        description: `Device ${newDeviceId} is already connected`,
        variant: "destructive"
      });
      return;
    }

    const newDevice: IoTDevice = {
      id: newDeviceId,
      name: `Device ${newDeviceId}`,
      type: "IoT Device",
      image: "/api/placeholder/80/80",
      status: 'online',
      connectedAt: new Date()
    };

    setDevices(prev => [...prev, newDevice]);
    setNewDeviceId('');
    
    toast({
      title: "Device Added",
      description: `${newDevice.name} has been connected successfully`,
    });
  };

  const handleDeleteDevice = (deviceId: string) => {
    setDevices(prev => prev.filter(d => d.id !== deviceId));
    
    toast({
      title: "Device Removed",
      description: `Device ${deviceId} has been disconnected`,
    });
  };

  const handleStartEdit = (device: IoTDevice) => {
    setEditingDevice(device.id);
    setEditName(device.name);
  };

  const handleSaveEdit = (deviceId: string) => {
    if (!editName.trim()) return;

    setDevices(prev => prev.map(d => 
      d.id === deviceId 
        ? { ...d, name: editName.trim() }
        : d
    ));

    setEditingDevice(null);
    setEditName('');
    
    toast({
      title: "Device Updated",
      description: "Device name has been updated successfully",
    });
  };

  const handleCancelEdit = () => {
    setEditingDevice(null);
    setEditName('');
  };

  // QR Scanner Functions
  const openQRScanner = () => {
    setIsQRModalOpen(true);
  };

  const closeQRScanner = () => {
    setIsQRModalOpen(false);
  };

  const handleQRScanResult = (scannedText: string) => {
    console.log('QR Code scanned:', scannedText);
    
    // Set the scanned text as the new device ID
    setNewDeviceId(scannedText);
    
    toast({
      title: "QR Code Scanned Successfully",
      description: `Device ID: ${scannedText}`,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Network className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">IoT Devices</h1>
          <p className="text-gray-600">Manage your connected IoT devices</p>
        </div>
      </div>

      {/* Add New Device Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Device
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter Device ID (e.g., FRZ003)"
                value={newDeviceId}
                onChange={(e) => setNewDeviceId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddDevice()}
                className="flex-1"
              />
              <Button 
                onClick={openQRScanner}
                variant="outline"
                className="px-4 flex items-center gap-2"
              >
                <QrCode className="h-4 w-4" />
                Scan QR
              </Button>
              <Button onClick={handleAddDevice}>
                Add Device
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Devices List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Connected Devices ({devices.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {devices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No devices connected yet</p>
              <p className="text-sm">Add your first IoT device above</p>
            </div>
          ) : (
            <div className="space-y-4">
              {devices.map((device) => (
                <div key={device.id} className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <img 
                    src={device.image} 
                    alt={device.name}
                    className="w-16 h-16 rounded-lg object-cover bg-gray-200"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {editingDevice === device.id ? (
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(device.id)}
                          className="font-medium text-gray-900 h-8"
                          autoFocus
                        />
                      ) : (
                        <h3 className="font-medium text-gray-900 truncate">
                          {device.name}
                        </h3>
                      )}
                      
                      <Badge 
                        variant={device.status === 'online' ? 'default' : 'secondary'}
                        className={device.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}
                      >
                        {device.status}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Type: {device.type}</p>
                      <p>Device ID: {device.id}</p>
                      <p>Connected: {formatDate(device.connectedAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {editingDevice === device.id ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSaveEdit(device.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCancelEdit}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStartEdit(device)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteDevice(device.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
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

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={isQRModalOpen}
        onClose={closeQRScanner}
        onScan={handleQRScanResult}
      />
    </div>
  );
};

export default ThingsPage;