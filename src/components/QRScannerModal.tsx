// src/components/QRScannerModal.tsx - Simple Fix for Loading Issue
import { useState, useEffect, useRef } from "react";
import { X, Camera, QrCode, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';

// Import jsQR as NPM package
import jsQR from 'jsqr';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (result: string) => void;
}

export function QRScannerModal({ isOpen, onClose, onScan }: QRScannerModalProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>("");
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();
  const streamRef = useRef<MediaStream | null>(null);

  // Start camera when modal opens
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setError("");
      setIsStartingCamera(true);
      console.log('Starting camera...');

      // Check basic camera support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser');
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment", // Prefer back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      streamRef.current = stream;

      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;
        
        // Start video and immediately update states
        await video.play();
        
        console.log('Video playing, updating states...');
        
        // Set states immediately after video starts
        setIsStartingCamera(false);
        setIsScanning(true);
        
        // Small delay to ensure video is ready, then start scanning
        setTimeout(() => {
          console.log('Starting QR scanning...');
          startScanning();
        }, 500);
      }
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      setIsStartingCamera(false);
      
      let errorMessage = "Tidak dapat mengakses kamera.";
      
      if (err.name === 'NotAllowedError') {
        errorMessage = "Akses kamera ditolak. Silakan izinkan akses kamera dan coba lagi.";
      } else if (err.name === 'NotFoundError') {
        errorMessage = "Kamera tidak ditemukan pada perangkat ini.";
      } else if (err.name === 'NotSupportedError') {
        errorMessage = "Kamera tidak didukung pada browser ini.";
      } else if (err.message.includes('Camera not supported')) {
        errorMessage = "Browser tidak mendukung akses kamera.";
      }
      
      setError(errorMessage);
      toast({
        title: "Camera Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const stopCamera = () => {
    console.log('Stopping camera...');
    
    // Clear scanning interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }

    // Stop video stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('Camera track stopped');
      });
      streamRef.current = null;
    }

    // Clear video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    // Reset states
    setIsScanning(false);
    setIsStartingCamera(false);
  };

  const startScanning = () => {
    if (!videoRef.current || !canvasRef.current) {
      console.warn('Video or canvas ref not available');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) {
      console.error('Cannot get canvas context');
      return;
    }

    console.log('QR scanning started');

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Scan every 500ms
    intervalRef.current = setInterval(() => {
      if (video.readyState >= 2) { // HAVE_CURRENT_DATA or higher
        // Set canvas size to match video (do this each time in case it changes)
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          // Draw video frame to canvas
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Get image data for QR detection
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          
          try {
            // Use jsQR to detect QR code
            const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "dontInvert",
            });
            
            if (qrCode && qrCode.data) {
              console.log("QR Code detected:", qrCode.data);
              
              // Stop scanning and camera
              stopCamera();
              
              // Call callback with result
              onScan(qrCode.data);
              
              // Show success toast
              toast({
                title: "QR Code Berhasil Discan",
                description: `Device ID: ${qrCode.data}`,
              });
              
              // Close modal
              handleClose();
            }
          } catch (err) {
            console.error("Error in QR detection:", err);
          }
        }
      }
    }, 500);
  };

  const handleClose = () => {
    console.log('Closing QR Scanner Modal');
    stopCamera();
    setError("");
    onClose();
  };

  const handleRetryCamera = () => {
    setError("");
    startCamera();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <Card className="w-full max-w-md bg-white animate-in slide-in-from-bottom-4 duration-300">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Scan QR Code
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="p-2 h-auto"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {/* Loading camera state */}
            {isStartingCamera && (
              <div className="text-center p-8">
                <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600 text-sm mb-4">Mengakses kamera...</p>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="text-center p-8">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 text-sm mb-4">{error}</p>
                <p className="text-gray-600 text-sm mb-4">
                  Silakan coba lagi atau input Device ID secara manual.
                </p>
                <div className="space-y-2">
                  <Button 
                    onClick={handleRetryCamera} 
                    variant="outline"
                    size="sm"
                  >
                    Coba Lagi
                  </Button>
                  <Button 
                    onClick={handleClose} 
                    variant="outline"
                    className="w-full"
                  >
                    Tutup & Input Manual
                  </Button>
                </div>
              </div>
            )}

            {/* Scanner interface */}
            {!error && !isStartingCamera && (
              <div className="space-y-4">
                <div className="relative">
                  <video
                    ref={videoRef}
                    className="w-full h-64 bg-black rounded-lg object-cover"
                    playsInline
                    muted
                    autoPlay
                  />
                  
                  {/* Scanning overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-48 border-2 border-blue-600 rounded-lg relative">
                      {/* Corner indicators */}
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-600"></div>
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-600"></div>
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-600"></div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-600"></div>
                      
                      {/* Animated scanning line */}
                      <div className="absolute inset-x-0 top-1/2 h-0.5 bg-blue-600 animate-pulse"></div>
                    </div>
                  </div>

                  {/* Status indicators */}
                  {isScanning && (
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                      <Camera className="h-3 w-3" />
                      Scanning...
                    </div>
                  )}
                  
                  {/* Hidden canvas for image processing */}
                  <canvas
                    ref={canvasRef}
                    className="hidden"
                  />
                </div>

                {/* Instructions */}
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Arahkan kamera ke QR code untuk scan Device ID
                  </p>
                </div>
              </div>
            )}

            {/* Footer button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={handleClose}
            >
              Tutup
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default QRScannerModal;