import React, { useState, useRef, useEffect } from 'react';
import { Network, Edit2, Trash2, Plus, Package, Check, X, QrCode, Camera, CameraOff, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

// Dynamic import for Html5QrcodeScanner
let Html5QrcodeScanner: any = null;

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
  const qrScannerRef = useRef<any>(null);
  const [isLibraryLoaded, setIsLibraryLoaded] = useState(false);
  const [libraryError, setLibraryError] = useState<string>('');
  const [loadingLibrary, setLoadingLibrary] = useState(true);
  
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
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Load QR Code library
  useEffect(() => {
    const loadQRLibrary = async () => {
      try {
        setLoadingLibrary(true);
        setDebugInfo('Loading QR library...');
        console.log('Attempting to load html5-qrcode library...');
        
        // Try dynamic import
        const module = await import('html5-qrcode');
        console.log('Module loaded:', module);
        
        Html5QrcodeScanner = module.Html5QrcodeScanner;
        console.log('Html5QrcodeScanner:', Html5QrcodeScanner);
        
        if (!Html5QrcodeScanner) {
          throw new Error('Html5QrcodeScanner not found in module');
        }
        
        setIsLibraryLoaded(true);
        setDebugInfo('QR library loaded successfully');
        console.log('QR Library loaded successfully');
        
        toast({
          title: "QR Scanner Ready",
          description: "QR Code scanner siap digunakan",
        });
        
      } catch (error: any) {
        console.error('Failed to load QR library:', error);
        setLibraryError(`Gagal memuat library QR Code: ${error.message}`);
        setDebugInfo(`Error: ${error.message}`);
        
        toast({
          title: "Library Error",
          description: "Install: npm install html5-qrcode",
          variant: "destructive"
        });
      } finally {
        setLoadingLibrary(false);
      }
    };

    loadQRLibrary();
  }, []);

  // Cleanup scanner when component unmounts
  useEffect(() => {
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.clear().catch((error: any) => {
          console.error("Error clearing QR scanner on unmount:", error);
        });
      }
    };
  }, []);

  // QR Code Scanner Functions
  const startQRScanner = async () => {
    console.log('Starting QR Scanner...');
    console.log('Html5QrcodeScanner available:', !!Html5QrcodeScanner);
    
    if (!Html5QrcodeScanner) {
      const errorMsg = "QR Scanner library tidak tersedia";
      setScanError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
      return;
    }

    try {
      setScanError('');
      setDebugInfo('Starting scanner...');
      setIsScanning(true);
      
      // Wait for DOM to update with the qr-reader element
      setTimeout(async () => {
        try {
          console.log('Waiting for qr-reader element...');
          
          // Check if element exists
          const qrReaderElement = document.getElementById("qr-reader");
          if (!qrReaderElement) {
            throw new Error('QR Reader element not found after timeout');
          }
          
          // Clear any existing scanner first
          qrReaderElement.innerHTML = '';
          console.log('Cleared existing scanner element');

          const qrCodeSuccessCallback = (decodedText: string, decodedResult: any) => {
            console.log(`QR Code scanned successfully: ${decodedText}`, decodedResult);
            setDebugInfo(`Scanned: ${decodedText}`);
            
            // Set the scanned QR code as device ID
            setNewDeviceId(decodedText);
            
            // Stop the scanner
            stopQRScanner();
            
            // Show success toast
            toast({
              title: "QR Code Berhasil Discan",
              description: `Device ID: ${decodedText}`,
            });
          };

          const qrCodeErrorCallback = (errorMessage: string) => {
            // Filter out common scanning errors that are not real errors
            if (errorMessage.includes('NotFoundException') || 
                errorMessage.includes('No QR code found') ||
                errorMessage.includes('QR code parse error')) {
              return; // These are normal when no QR code is visible
            }
            
            console.log(`QR scan error (non-critical): ${errorMessage}`);
            setDebugInfo(`Scanning... (${errorMessage.substring(0, 30)}...)`);
          };

          console.log('Creating Html5QrcodeScanner instance...');
          
          // Initialize scanner with comprehensive configuration
          qrScannerRef.current = new Html5QrcodeScanner(
            "qr-reader",
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0,
              showTorchButtonIfSupported: true,
              showZoomSliderIfSupported: true,
              defaultZoomValueIfSupported: 1,
              rememberLastUsedCamera: true,
              supportedScanTypes: [0], // Only QR Code
              useBarCodeDetectorIfSupported: true,
              experimentalFeatures: {
                useBarCodeDetectorIfSupported: true
              }
            },
            false // verbose = false
          );

          console.log('Scanner instance created, calling render...');
          
          // Render the scanner
          await qrScannerRef.current.render(qrCodeSuccessCallback, qrCodeErrorCallback);
          
          console.log('Scanner rendered successfully');
          setDebugInfo('Scanner aktif - arahkan ke QR Code');
          
          // Check if video element is created after a delay
          setTimeout(() => {
            const videoElement = document.querySelector('#qr-reader video') as HTMLVideoElement;
            if (videoElement) {
              console.log('Video element found:', videoElement);
              setDebugInfo('Kamera aktif - siap scan QR Code');
            } else {
              console.log('Video element not found');
              setScanError('Video element tidak ditemukan - coba refresh halaman');
            }
          }, 2000);

        } catch (innerError: any) {
          console.error('Error in delayed scanner setup:', innerError);
          setIsScanning(false);
          const errorMsg = `Gagal memulai scanner: ${innerError.message || innerError}`;
          setScanError(errorMsg);
          setDebugInfo(`Error: ${innerError.message}`);
          
          toast({
            title: "Scanner Error",
            description: errorMsg,
            variant: "destructive"
          });
        }
      }, 100); // Wait 100ms for DOM to update

    } catch (error: any) {
      console.error('Error starting QR scanner:', error);
      setIsScanning(false);
      const errorMsg = `Gagal memulai scanner: ${error.message || error}`;
      setScanError(errorMsg);
      setDebugInfo(`Error: ${error.message}`);
      
      toast({
        title: "Scanner Error",
        description: errorMsg,
        variant: "destructive"
      });
    }
  };

  const stopQRScanner = () => {
    console.log('Stopping QR Scanner...');
    setDebugInfo('Stopping scanner...');
    
    if (qrScannerRef.current) {
      qrScannerRef.current.clear()
        .then(() => {
          console.log('QR Scanner cleared successfully');
          setIsScanning(false);
          setScanError('');
          setDebugInfo('Scanner stopped');
          qrScannerRef.current = null;
        })
        .catch((error: any) => {
          console.error("Error clearing QR scanner:", error);
          setIsScanning(false);
          setScanError('');
          setDebugInfo('Scanner force stopped');
          qrScannerRef.current = null;
        });
    } else {
      setIsScanning(false);
      setScanError('');
      setDebugInfo('Scanner stopped');
    }
  };

  // Manual camera permission check
  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      toast({
        title: "Camera Access",
        description: "Kamera dapat diakses dengan normal.",
      });
      return true;
    } catch (error: any) {
      console.error('Camera permission error:', error);
      toast({
        title: "Camera Error",
        description: `Tidak dapat mengakses kamera: ${error.name}`,
        variant: "destructive"
      });
      return false;
    }
  };

  // Debug library status
  const debugLibraryStatus = () => {
    console.log('=== QR Library Debug Info ===');
    console.log('Library loaded:', isLibraryLoaded);
    console.log('Html5QrcodeScanner:', Html5QrcodeScanner);
    console.log('Loading library:', loadingLibrary);
    console.log('Library error:', libraryError);
    console.log('Is scanning:', isScanning);
    console.log('Current scanner ref:', qrScannerRef.current);
    
    toast({
      title: "Debug Info",
      description: `Library: ${isLibraryLoaded ? 'Loaded' : 'Not Loaded'}`,
    });
  };

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

      {/* Library Status Alert */}
      {loadingLibrary && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Loading QR Code library...</AlertDescription>
        </Alert>
      )}

      {libraryError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{libraryError}</AlertDescription>
        </Alert>
      )}

      {/* Add Device Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Device
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Input and Buttons Row */}
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
              <Button 
                variant="outline" 
                onClick={isScanning ? stopQRScanner : startQRScanner}
                className="px-4 flex items-center gap-2"
                disabled={loadingLibrary || !isLibraryLoaded}
              >
                {isScanning ? (
                  <>
                    <CameraOff className="h-4 w-4" />
                    Stop
                  </>
                ) : (
                  <>
                    <QrCode className="h-4 w-4" />
                    {loadingLibrary ? 'Loading...' : 'Scan QR'}
                  </>
                )}
              </Button>
            </div>

            {/* Debug Buttons
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={checkCameraPermission}
                className="text-sm"
              >
                Test Camera
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={debugLibraryStatus}
                className="text-sm"
              >
                Debug Library
              </Button>
            </div> */}

            {/* Debug Info */}
            {debugInfo && (
              <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded border">
                Debug: {debugInfo}
              </div>
            )}

            {/* QR Scanner Container */}
            {isScanning && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Camera className="h-4 w-4" />
                  Arahkan kamera ke QR Code. Pastikan QR Code terlihat jelas dalam kotak.
                </div>
                
                {scanError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{scanError}</AlertDescription>
                  </Alert>
                )}
                
                <div 
                  id="qr-reader" 
                  className="w-full max-w-md mx-auto border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50"
                  style={{ minHeight: '400px' }}
                ></div>
                
                <div className="text-center">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={stopQRScanner}
                    className="mt-2"
                  >
                    Batal Scan
                  </Button>
                </div>
              </div>
            )}
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
    </div>
  );
};

export default ThingsPage;