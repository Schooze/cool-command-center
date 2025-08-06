import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Settings, AlertTriangle, CheckCircle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Import Leaflet
import L from 'leaflet';

// Fix default markers
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.divIcon({
  html: `<div style="background-color: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
  iconSize: [12, 12],
  className: 'custom-div-icon'
});

L.Marker.prototype.options.icon = DefaultIcon;

// Mock data untuk device maintenance
interface MaintenanceDevice {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: 'optimal' | 'warning' | 'dangerous';
  issues: string[];
  lastMaintenance: string;
  nextMaintenance: string;
}

const mockDevices: MaintenanceDevice[] = [
  {
    id: 'KRN-001',
    name: 'Freezer Unit Jakarta',
    lat: -6.1751,
    lng: 106.8650,
    status: 'optimal',
    issues: [],
    lastMaintenance: '2024-07-15',
    nextMaintenance: '2024-08-15'
  },
  {
    id: 'KRN-002',
    name: 'Cooling System Surabaya',
    lat: -7.2575,
    lng: 112.7521,
    status: 'warning',
    issues: ['Temperature fluctuation detected', 'Filter needs replacement'],
    lastMaintenance: '2024-06-20',
    nextMaintenance: '2024-08-20'
  },
  {
    id: 'KRN-003',
    name: 'Refrigeration Bandung',
    lat: -6.9147,
    lng: 107.6098,
    status: 'dangerous',
    issues: ['Compressor failure', 'Emergency shutdown required'],
    lastMaintenance: '2024-05-10',
    nextMaintenance: '2024-07-10'
  },
  {
    id: 'KRN-004',
    name: 'Cold Storage Medan',
    lat: 1.4542,
    lng: 98.7017,
    status: 'optimal',
    issues: [],
    lastMaintenance: '2024-07-25',
    nextMaintenance: '2024-08-25'
  },
  {
    id: 'KRN-005',
    name: 'Freezer Complex Makassar',
    lat: -5.1477,
    lng: 119.4327,
    status: 'warning',
    issues: ['Door seal inspection needed'],
    lastMaintenance: '2024-07-01',
    nextMaintenance: '2024-08-01'
  },
  {
    id: 'KRN-006',
    name: 'Cold Storage Bangkok',
    lat: 13.7563,
    lng: 100.5018,
    status: 'optimal',
    issues: [],
    lastMaintenance: '2024-07-20',
    nextMaintenance: '2024-08-20'
  },
  {
    id: 'KRN-007',
    name: 'Refrigeration Singapore',
    lat: 1.3521,
    lng: 103.8198,
    status: 'warning',
    issues: ['Power consumption high'],
    lastMaintenance: '2024-06-30',
    nextMaintenance: '2024-07-30'
  },
  {
    id: 'KRN-008',
    name: 'Freezer Unit Manila',
    lat: 14.5995,
    lng: 120.9842,
    status: 'dangerous',
    issues: ['Cooling system failure', 'Temperature too high'],
    lastMaintenance: '2024-05-15',
    nextMaintenance: '2024-07-15'
  }
];

const MaintenancePage: React.FC = () => {
  const [selectedDevice, setSelectedDevice] = useState<MaintenanceDevice | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return '#22c55e'; // Green
      case 'warning': return '#eab308'; // Yellow  
      case 'dangerous': return '#ef4444'; // Red
      default: return '#6b7280'; // Gray
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimal': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'dangerous': return <AlertTriangle className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  const createCustomIcon = (status: string) => {
    const color = getStatusColor(status);
    return L.divIcon({
      html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [16, 16],
      className: 'custom-div-icon'
    });
  };

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView([-2.5, 118], 4);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    mapInstanceRef.current = map;

    // Add device markers
    mockDevices.forEach((device) => {
      const marker = L.marker([device.lat, device.lng], {
        icon: createCustomIcon(device.status)
      }).addTo(map);

      // Create popup content
      const popupContent = `
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-weight: bold;">${device.name}</h3>
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">ID: ${device.id}</p>
          <div style="margin: 8px 0;">
            <span style="display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; color: white; background-color: ${getStatusColor(device.status)};">
              ${device.status.toUpperCase()}
            </span>
          </div>
          ${device.issues.length > 0 ? `
            <div style="margin: 8px 0;">
              <strong style="color: #ef4444;">Issues:</strong>
              <ul style="margin: 4px 0; padding-left: 16px; font-size: 12px;">
                ${device.issues.map(issue => `<li>${issue}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          <div style="margin: 8px 0; font-size: 12px;">
            <div><strong>Last Maintenance:</strong> ${device.lastMaintenance}</div>
            <div><strong>Next Maintenance:</strong> ${device.nextMaintenance}</div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      // Handle marker click
      marker.on('click', () => {
        setSelectedDevice(device);
      });

      markersRef.current.push(marker);
    });

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current = [];
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Maintenance Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage device maintenance across all locations</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            {mockDevices.filter(d => d.status === 'optimal').length} Optimal
          </Badge>
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            {mockDevices.filter(d => d.status === 'warning').length} Warning
          </Badge>
          <Badge variant="outline" className="text-red-600 border-red-600">
            {mockDevices.filter(d => d.status === 'dangerous').length} Dangerous
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Device Location Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Leaflet Map Container */}
              <div
                ref={mapRef}
                className="w-full rounded-lg overflow-hidden border"
                style={{ height: '500px' }}
              />

              {/* Status Legend */}
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 space-y-2 shadow-lg z-[1000]">
                <div className="text-sm font-medium">Status Legend</div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Optimal</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span>Warning</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Dangerous</span>
                </div>
              </div>

              {/* Map Instructions */}
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-2 text-xs text-muted-foreground shadow-lg z-[1000]">
                Click markers for details • Use mouse wheel to zoom • Drag to pan
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Device Details Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Device Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDevice ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedDevice.name}</h3>
                  <p className="text-sm text-muted-foreground">ID: {selectedDevice.id}</p>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedDevice.status)}
                  <Badge 
                    variant="outline" 
                    className={`
                      ${selectedDevice.status === 'optimal' ? 'text-green-600 border-green-600' : ''}
                      ${selectedDevice.status === 'warning' ? 'text-yellow-600 border-yellow-600' : ''}
                      ${selectedDevice.status === 'dangerous' ? 'text-red-600 border-red-600' : ''}
                    `}
                  >
                    {selectedDevice.status.toUpperCase()}
                  </Badge>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Location</h4>
                  <p className="text-sm text-muted-foreground">
                    Lat: {selectedDevice.lat}°, Lng: {selectedDevice.lng}°
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Maintenance Schedule</h4>
                  <div className="text-sm space-y-1">
                    <p>Last: {selectedDevice.lastMaintenance}</p>
                    <p>Next: {selectedDevice.nextMaintenance}</p>
                  </div>
                </div>

                {selectedDevice.issues.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 text-red-600">Current Issues</h4>
                    <ul className="text-sm space-y-1">
                      {selectedDevice.issues.map((issue, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <AlertTriangle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button className="w-full">
                  Schedule Maintenance
                </Button>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Click on a device marker on the map to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Device List */}
      <Card>
        <CardHeader>
          <CardTitle>All Devices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockDevices.map((device) => (
              <div
                key={device.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedDevice?.id === device.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => {
                  setSelectedDevice(device);
                  // Center map on selected device
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.setView([device.lat, device.lng], 8);
                  }
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-sm">{device.name}</h3>
                    <p className="text-xs text-muted-foreground">{device.id}</p>
                  </div>
                  <Badge 
                    variant="outline"
                    className={`text-xs
                      ${device.status === 'optimal' ? 'text-green-600 border-green-600' : ''}
                      ${device.status === 'warning' ? 'text-yellow-600 border-yellow-600' : ''}
                      ${device.status === 'dangerous' ? 'text-red-600 border-red-600' : ''}
                    `}
                  >
                    {device.status}
                  </Badge>
                </div>
                
                {device.issues.length > 0 && (
                  <div className="text-xs text-red-600 mb-2">
                    {device.issues.length} issue{device.issues.length > 1 ? 's' : ''}
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground">
                  Next: {device.nextMaintenance}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenancePage;