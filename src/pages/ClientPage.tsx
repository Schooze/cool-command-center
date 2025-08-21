// src/pages/ClientPage.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Snowflake, 
  Thermometer, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  LogOut,
  RefreshCw,
  Clock
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const ClientPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock data untuk client monitoring
  const mockDevices = [
    {
      id: '1',
      name: 'Freezer Unit A-1',
      location: 'Gudang A',
      temperature: -18.2,
      status: 'normal',
      lastUpdate: '2 menit lalu'
    },
    {
      id: '2',
      name: 'Freezer Unit A-2', 
      location: 'Gudang A',
      temperature: -17.8,
      status: 'normal',
      lastUpdate: '1 menit lalu'
    },
    {
      id: '3',
      name: 'Freezer Unit B-1',
      location: 'Gudang B', 
      temperature: -15.5,
      status: 'warning',
      lastUpdate: '3 menit lalu'
    },
    {
      id: '4',
      name: 'Freezer Unit B-2',
      location: 'Gudang B',
      temperature: 0,
      status: 'offline',
      lastUpdate: '2 jam lalu'
    }
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'offline': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'offline': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const normalDevices = mockDevices.filter(d => d.status === 'normal').length;
  const warningDevices = mockDevices.filter(d => d.status === 'warning').length;
  const offlineDevices = mockDevices.filter(d => d.status === 'offline').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Snowflake className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Koronka IoT - Portal Client</h1>
              <p className="text-sm text-gray-500">Monitoring Peralatan Pendingin</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.username}</p>
              <Badge className="bg-purple-100 text-purple-800">Client</Badge>
            </div>
            <Button onClick={logout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Keluar
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard Monitoring</h2>
            <p className="text-sm text-gray-500">
              Selamat datang, {user?.username}! Pantau status peralatan Anda.
            </p>
          </div>
          <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Memperbarui...' : 'Perbarui'}
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Normal</p>
                  <p className="text-2xl font-bold text-gray-900">{normalDevices}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Peringatan</p>
                  <p className="text-2xl font-bold text-gray-900">{warningDevices}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Offline</p>
                  <p className="text-2xl font-bold text-gray-900">{offlineDevices}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Thermometer className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Device</p>
                  <p className="text-2xl font-bold text-gray-900">{mockDevices.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Device Status List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Status Device Real-time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockDevices.map((device) => (
                <div 
                  key={device.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100">
                      <Snowflake className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{device.name}</h4>
                      <p className="text-sm text-gray-500">{device.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Suhu</p>
                      <p className={`text-lg font-bold ${
                        device.status === 'offline' ? 'text-gray-400' : 
                        device.status === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                      }`}>
                        {device.status === 'offline' ? '--' : `${device.temperature}°C`}
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Status</p>
                      <Badge className={getStatusColor(device.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(device.status)}
                          <span className="capitalize">
                            {device.status === 'normal' ? 'Normal' :
                             device.status === 'warning' ? 'Peringatan' : 'Offline'}
                          </span>
                        </div>
                      </Badge>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Update</p>
                      <p className="text-sm text-gray-700">{device.lastUpdate}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Simple Alert Panel */}
        {warningDevices > 0 || offlineDevices > 0 ? (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="h-5 w-5" />
                Peringatan Sistem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {warningDevices > 0 && (
                  <p className="text-sm text-yellow-700">
                    • {warningDevices} device memiliki suhu di luar batas normal
                  </p>
                )}
                {offlineDevices > 0 && (
                  <p className="text-sm text-yellow-700">
                    • {offlineDevices} device sedang offline dan perlu diperiksa
                  </p>
                )}
                <p className="text-xs text-yellow-600 mt-2">
                  Hubungi teknisi jika masalah berlanjut
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Semua sistem berjalan normal</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ClientPage;