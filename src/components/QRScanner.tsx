// Alternative approach menggunakan useEffect untuk handle DOM ready
import React, { useState, useRef, useEffect } from 'react';
import { QrCode, Camera, CameraOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

let Html5QrcodeScanner: any = null;

interface QRScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onError }) => {
  const { toast } = useToast();
  const qrScannerRef = useRef<any>(null);
  const [isLibraryLoaded, setIsLibraryLoaded] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Load QR library
  useEffect(() => {
    const loadLibrary = async () => {
      try {
        const module = await import('html5-qrcode');
        Html5QrcodeScanner = module.Html5QrcodeScanner;
        setIsLibraryLoaded(true);
        setDebugInfo('QR library ready');
      } catch (error: any) {
        onError?.(`Library error: ${error.message}`);
        setScanError(`Library error: ${error.message}`);
      }
    };
    loadLibrary();
  }, [onError]);

  // Initialize scanner when isScanning becomes true
  useEffect(() => {
    if (!isScanning || !isLibraryLoaded || !Html5QrcodeScanner) {
      return;
    }

    const initScanner = async () => {
      try {
        setDebugInfo('Initializing scanner...');
        
        // Double check element exists
        const element = document.getElementById('qr-reader-alt');
        if (!element) {
          throw new Error('Scanner element not found');
        }

        // Clear any existing content
        element.innerHTML = '';

        const onScanSuccess = (decodedText: string) => {
          console.log('QR Scan Success:', decodedText);
          setDebugInfo(`Scanned: ${decodedText}`);
          onScan(decodedText);
          setIsScanning(false); // Stop scanning
          
          toast({
            title: "QR Code Scanned",
            description: `Result: ${decodedText}`,
          });
        };

        const onScanFailure = (error: string) => {
          if (!error.includes('NotFoundException')) {
            console.log('Scan error:', error);
          }
        };

        // Create scanner instance
        qrScannerRef.current = new Html5QrcodeScanner(
          "qr-reader-alt",
          {
            fps: 10,
            qrbox: { width: 280, height: 280 },
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true,
            rememberLastUsedCamera: true
          },
          false
        );

        // Start scanning
        await qrScannerRef.current.render(onScanSuccess, onScanFailure);
        setDebugInfo('Scanner active');

      } catch (error: any) {
        console.error('Scanner init error:', error);
        setScanError(`Scanner error: ${error.message}`);
        setIsScanning(false);
        
        toast({
          title: "Scanner Error",
          description: error.message,
          variant: "destructive"
        });
      }
    };

    // Add small delay to ensure DOM is ready
    const timer = setTimeout(initScanner, 150);
    
    return () => clearTimeout(timer);
  }, [isScanning, isLibraryLoaded, onScan, toast]);

  // Cleanup scanner
  useEffect(() => {
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.clear().catch(console.error);
      }
    };
  }, []);

  const toggleScanner = () => {
    if (isScanning) {
      // Stop scanning
      if (qrScannerRef.current) {
        qrScannerRef.current.clear().then(() => {
          setIsScanning(false);
          setDebugInfo('Scanner stopped');
          setScanError('');
        }).catch(console.error);
      } else {
        setIsScanning(false);
      }
    } else {
      // Start scanning
      if (!isLibraryLoaded) {
        toast({
          title: "Error",
          description: "QR library not loaded",
          variant: "destructive"
        });
        return;
      }
      setScanError('');
      setIsScanning(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex gap-2 items-center">
        <Button
          variant="outline"
          onClick={toggleScanner}
          disabled={!isLibraryLoaded}
          className="flex items-center gap-2"
        >
          {isScanning ? (
            <>
              <CameraOff className="h-4 w-4" />
              Stop Scanner
            </>
          ) : (
            <>
              <QrCode className="h-4 w-4" />
              Start Scanner
            </>
          )}
        </Button>
        
        {!isLibraryLoaded && (
          <span className="text-sm text-gray-500">Loading library...</span>
        )}
      </div>

      {/* Debug info */}
      {debugInfo && (
        <div className="text-sm bg-blue-50 text-blue-700 p-2 rounded border">
          {debugInfo}
        </div>
      )}

      {/* Error display */}
      {scanError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{scanError}</AlertDescription>
        </Alert>
      )}

      {/* Scanner container */}
      {isScanning && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Camera className="h-4 w-4" />
            Point camera at QR code
          </div>
          
          <div
            id="qr-reader-alt"
            className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 min-h-[350px] flex items-center justify-center"
          >
            {/* Scanner will be rendered here */}
            <div className="text-gray-500">Initializing camera...</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRScanner;