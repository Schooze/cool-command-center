// src/pages/ThingsPage.tsx - TAMPILAN ASLI + DeviceService yang Fixed
import React, { useState, useEffect } from 'react';
import { Network, Edit2, Trash2, Plus, Package, Check, X, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { deviceService } from '@/services/deviceService';

// Type definitions based on backend schema
interface Product {
  id: string;
  serial_number: string;
  name: string;
  product_type_name: string;
  status: 'online' | 'offline';
  installed_at: string;
  location_lat?: number;
  location_long?: number;
}

interface DeviceRegistrationRequest {
  device_id: string;
}

interface DeviceRegistrationResponse {
  success: boolean;
  message: string;
  product?: any;
}

const ThingsPage: React.FC = () => {
  const { toast } = useToast();
  
  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newDeviceId, setNewDeviceId] = useState('');
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  // Fetch products from backend using deviceService (FIXED)
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await deviceService.getProducts();
      
      console.log('Fetched products:', data); // Debug log
      
      // Remove duplicates based on ID
      const uniqueProducts = data.filter((product: Product, index: number, self: Product[]) => 
        index === self.findIndex(p => p.id === product.id)
      );
      
      console.log('Unique products:', uniqueProducts); // Debug log
      setProducts(uniqueProducts);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      
      let errorMessage = "Failed to load devices. Please try again.";
      
      if (error.name === 'DeviceNetworkError') {
        errorMessage = "Cannot connect to device service. Check backend connection.";
      } else if (error.name === 'DeviceEndpointNotFound') {
        errorMessage = "Device API endpoint not found. Check backend configuration.";
      } else if (error.response?.status === 401) {
        errorMessage = "Session expired. Please login again.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Register new device using deviceService (FIXED)
  const handleAddDevice = async () => {
    if (!newDeviceId.trim()) {
      toast({
        title: "Error",
        description: "Device ID tidak boleh kosong",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);
      
      const data: DeviceRegistrationResponse = await deviceService.registerDevice(newDeviceId.trim());

      if (data.success) {
        toast({
          title: "Success",
          description: data.message,
        });
        
        setNewDeviceId('');
        // Refresh products list
        await fetchProducts();
      }
    } catch (error: any) {
      console.error('Error registering device:', error);
      
      // Handle structured error responses
      if (error.response?.data?.detail && typeof error.response.data.detail === 'object') {
        const { type, message, suggestion } = error.response.data.detail;
        
        // Customize toast based on error type
        let title = "Error";
        let variant: "destructive" | "default" = "destructive";
        
        if (type === "DEVICE_ALREADY_REGISTERED") {
          title = "Device Already Registered";
          variant = "default"; // Less alarming for already registered
        } else if (type === "UNKNOWN_DEVICE_PREFIX") {
          title = "Invalid Device Format";
        } else if (type === "INFLUXDB_VALIDATION_FAILED") {
          title = "Device Not Found in InfluxDB";
          variant = "destructive";
        } else if (type === "PRODUCT_TYPE_NOT_FOUND") {
          title = "System Configuration Error";
        }
        
        toast({
          title: title,
          description: (
            <div className="space-y-2">
              <p>{message}</p>
              {suggestion && (
                <p className="text-sm opacity-80">
                  💡 {suggestion}
                </p>
              )}
            </div>
          ),
          variant: variant
        });
      } else {
        // Fallback for simple error messages
        const errorMessage = error.response?.data?.detail || 
                           error.response?.data?.message || 
                           error.message || 
                           "Failed to register device";
        
        toast({
          title: "Registration Failed",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Update product name using deviceService (FIXED)
  const saveEdit = async () => {
    if (!editName.trim()) {
      toast({
        title: "Error",
        description: "Nama device tidak boleh kosong",
        variant: "destructive"
      });
      return;
    }

    if (!editingProduct) return;

    try {
      const data = await deviceService.updateProductName(editingProduct, editName.trim());

      if (data.success) {
        toast({
          title: "Success",
          description: data.message,
        });
        
        setEditingProduct(null);
        setEditName('');
        // Refresh products list
        await fetchProducts();
      }
    } catch (error: any) {
      console.error('Error updating product name:', error);
      
      const errorMessage = error.response?.data?.detail || 
                         error.response?.data?.message || 
                         error.message || 
                         "Network error. Please try again.";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  // Delete product using deviceService (FIXED)
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this device?')) {
      return;
    }

    try {
      console.log('Deleting product:', productId); // Debug log
      
      const data = await deviceService.deleteProduct(productId);
      
      if (data.success) {
        toast({
          title: "Success",
          description: data.message,
        });
        
        // Refresh products list
        await fetchProducts();
      }
    } catch (error: any) {
      console.error('Error deleting product:', error);
      
      const errorMessage = error.response?.data?.detail || 
                         error.response?.data?.message || 
                         error.message || 
                         "Network error. Please try again.";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  // Edit functions
  const startEdit = (product: Product) => {
    setEditingProduct(product.id);
    setEditName(product.name);
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setEditName('');
  };

  // Handle enter key for adding device
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !submitting) {
      handleAddDevice();
    }
  };

  // Load products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Calculate statistics
  const onlineDevices = products.filter(p => p.status === 'online').length;
  const offlineDevices = products.filter(p => p.status === 'offline').length;

  return (
    <div className="space-y-6">
      {/* Header - TAMPILAN ASLI */}
      <div className="flex items-center gap-3">
        <Network className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Things</h1>
        <Badge variant="outline" className="ml-auto">
          {products.length} Connected Devices
        </Badge>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchProducts}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Add Device Section - TAMPILAN ASLI */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Device
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Enter Device ID (e.g., F0101ABC123)"
                value={newDeviceId}
                onChange={(e) => setNewDeviceId(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
                disabled={submitting}
              />
              <Button 
                onClick={handleAddDevice} 
                className="px-6"
                disabled={submitting}
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Validating...
                  </div>
                ) : (
                  'Submit'
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              * Device ID format: F0101 + MAC Address (e.g., F0101ABC123DEF456)
              <br />
              * Device harus sudah mengirim data ke InfluxDB untuk bisa didaftarkan
              <br />
              * Prefix F0101 akan didaftarkan sebagai Commercial Freezer
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Devices List - TAMPILAN ASLI */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Connected Devices
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Loading devices...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Belum ada device yang terhubung</p>
              <p className="text-sm mt-2">Gunakan form di atas untuk menambahkan device baru</p>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product, index) => (
                <div 
                  key={`product-${product.id}-${index}`} // More unique key
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {/* Device Image - TAMPILAN ASLI */}
                  <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>

                  {/* Device Info - TAMPILAN ASLI */}
                  <div className="flex-1 min-w-0">
                    {editingProduct === product.id ? (
                      <div className="space-y-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="font-medium"
                          onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                        />
                        <p className="text-sm text-muted-foreground">{product.product_type_name}</p>
                      </div>
                    ) : (
                      <div>
                        <h3 className="font-medium truncate">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">{product.product_type_name}</p>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge 
                        variant={product.status === 'online' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {product.status === 'online' ? '🟢' : '🔴'} {product.status.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        ID: {product.serial_number}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Installed: {new Date(product.installed_at).toLocaleDateString()}
                      </span>
                      {product.location_lat && product.location_long && (
                        <span className="text-xs text-muted-foreground">
                          📍 {product.location_lat.toFixed(4)}, {product.location_long.toFixed(4)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons - TAMPILAN ASLI */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {editingProduct === product.id ? (
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
                          onClick={() => startEdit(product)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteProduct(product.id)}
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

      {/* Statistics - TAMPILAN ASLI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Devices</p>
                <p className="text-2xl font-bold">{products.length}</p>
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
                <p className="text-2xl font-bold text-green-600">{onlineDevices}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-green-600"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Offline</p>
                <p className="text-2xl font-bold text-red-600">{offlineDevices}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-red-600"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ThingsPage;

// Export deviceService untuk komponen lain
export { deviceService };