import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Wrench, 
  Clock, 
  CheckCircle, 
  FileText, 
  Save,
  User,
  Calendar,
  PenTool,
  Zap,
  Activity,
  Settings,
  Shield,
  Snowflake,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const TeknisiPage: React.FC = () => {
  const { user, logout } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDateTime] = useState(new Date().toISOString().slice(0, 16));
  const [ownerDateTime] = useState(new Date().toISOString().slice(0, 16));
  
  const [formData, setFormData] = useState({
    workUnderWarranty: '',
    visitOutcome: '',
    workPerformed: '',
    maintenanceWorkerName: user?.username || '',
    visitDateTime: currentDateTime,
    remarks: '',
    ownerSignature: '',
    ownerName: '',
    ownerDateTime: ownerDateTime
  });

  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Initialize canvas for signature
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Make canvas responsive
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = window.innerWidth < 640 ? 200 : 150; // Larger height for mobile
      
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = window.innerWidth < 640 ? 4 : 3; // Even thicker lines for mobile
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Add passive event listeners for touch events to prevent scroll
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const handleLogout = () => {
    logout();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Touch-friendly signature drawing functions
  const getEventPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      // Touch event
      const touch = e.touches[0] || e.changedTouches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {
      // Mouse event
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { x, y } = getEventPos(e);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const { x, y } = getEventPos(e);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSubmit = async () => {
    setSubmitStatus('loading');
    
    // Get signature data
    const canvas = canvasRef.current;
    const signatureData = canvas ? canvas.toDataURL() : '';
    
    const finalFormData = {
      ...formData,
      ownerSignature: signatureData
    };
    
    // Mock API call
    setTimeout(() => {
      console.log('Form submitted:', finalFormData);
      setSubmitStatus('success');
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          workUnderWarranty: '',
          visitOutcome: '',
          workPerformed: '',
          maintenanceWorkerName: user?.username || '',
          visitDateTime: new Date().toISOString().slice(0, 16),
          remarks: '',
          ownerSignature: '',
          ownerName: '',
          ownerDateTime: new Date().toISOString().slice(0, 16)
        });
        clearSignature();
        setSubmitStatus('idle');
      }, 2000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header without sidebar */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Wrench className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Koronka IoT Dashboard</h1>
                  <p className="text-sm text-gray-500">Panel Teknisi</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {user?.username}
              </Badge>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile-Optimized Content */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Hero Section - Compact for mobile */}
        <div className="space-y-2 mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
            Selamat datang, {user?.username}!
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Lengkapi laporan maintenance dan perbaikan peralatan pendingin daging.
          </p>
        </div>

        {/* Main Form - Mobile Optimized */}
        <Card className="bg-white/95 backdrop-blur border-0 shadow-xl">
          <CardHeader className="pb-4 px-4 sm:px-6">
            <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-3 sm:gap-0">
              <div className="min-w-0 flex-1">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-foreground">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-1.5 sm:p-2 rounded-lg">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <span className="text-base sm:text-xl">Laporan Maintenance</span>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Lengkapi laporan maintenance dan inspeksi peralatan pendingin
                </p>
              </div>
              <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50 self-start sm:self-center">
                <Shield className="h-3 w-3 mr-1" />
                Form
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="px-4 sm:px-6">
            <div className="space-y-6 sm:space-y-8">
              {/* Work Details Section */}
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-2 pb-2">
                  <Settings className="h-4 w-4 text-blue-600" />
                  <h3 className="text-base sm:text-lg font-semibold">Detail Pekerjaan</h3>
                </div>
                
                {/* Mobile-First Grid Layout */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="maintenanceWorkerName" className="text-sm font-medium">
                        Nama pekerja maintenance
                      </Label>
                      <div className="relative">
                        <Input
                          id="maintenanceWorkerName"
                          value={formData.maintenanceWorkerName}
                          onChange={(e) => handleInputChange('maintenanceWorkerName', e.target.value)}
                          className="bg-muted/30 rounded-lg h-12 pr-10 text-base"
                          readOnly
                        />
                        <User className="absolute right-3 top-3.5 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="visitDateTime" className="text-sm font-medium">
                        Tanggal dan Waktu
                      </Label>
                      <div className="relative">
                        <Input
                          id="visitDateTime"
                          type="datetime-local"
                          value={formData.visitDateTime}
                          onChange={(e) => handleInputChange('visitDateTime', e.target.value)}
                          className="bg-muted/30 rounded-lg h-12 pr-10 text-base"
                          readOnly
                        />
                        <Calendar className="absolute right-3 top-3.5 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="workUnderWarranty" className="text-sm font-medium">
                        Pekerjaan dalam garansi
                      </Label>
                      <select
                        id="workUnderWarranty"
                        className="flex h-12 w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-base ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 appearance-none"
                        value={formData.workUnderWarranty}
                        onChange={(e) => handleInputChange('workUnderWarranty', e.target.value)}
                        required
                      >
                        <option value="">Pilih opsi</option>
                        <option value="yes">Ya</option>
                        <option value="no">Tidak</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="visitOutcome" className="text-sm font-medium">
                        Hasil kunjungan
                      </Label>
                      <select
                        id="visitOutcome"
                        className="flex h-12 w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-base ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 appearance-none"
                        value={formData.visitOutcome}
                        onChange={(e) => handleInputChange('visitOutcome', e.target.value)}
                        required
                      >
                        <option value="">Pilih hasil</option>
                        <option value="issued_closed">Masalah selesai</option>
                        <option value="inspected_will_return">Diperiksa - akan kembali untuk perbaikan</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workPerformed" className="text-sm font-medium">
                      Pekerjaan yang dilakukan atau komentar
                    </Label>
                    <Textarea
                      id="workPerformed"
                      placeholder="Jelaskan pekerjaan yang dilakukan, masalah yang ditemukan, atau komentar..."
                      value={formData.workPerformed}
                      onChange={(e) => handleInputChange('workPerformed', e.target.value)}
                      required
                      rows={4}
                      className="resize-none rounded-lg bg-background/50 transition-all text-base min-h-[100px]"
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-border/50" />

              {/* Owner/Resident Section */}
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-2 pb-2">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <h3 className="text-base sm:text-lg font-semibold">Bagian Pemilik/Penghuni</h3>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="ownerName" className="text-sm font-medium">
                        Nama pemilik/penghuni
                      </Label>
                      <Input
                        id="ownerName"
                        placeholder="Masukkan nama lengkap"
                        value={formData.ownerName}
                        onChange={(e) => handleInputChange('ownerName', e.target.value)}
                        className="rounded-lg h-12 bg-background/50 text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ownerDateTime" className="text-sm font-medium">
                        Tanggal & waktu tanda tangan
                      </Label>
                      <div className="relative">
                        <Input
                          id="ownerDateTime"
                          type="datetime-local"
                          value={formData.ownerDateTime}
                          onChange={(e) => handleInputChange('ownerDateTime', e.target.value)}
                          className="bg-muted/30 rounded-lg h-12 pr-10 text-base"
                          readOnly
                        />
                        <Calendar className="absolute right-3 top-3.5 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="remarks" className="text-sm font-medium">
                      Catatan
                    </Label>
                    <p className="text-sm text-muted-foreground italic mb-2">
                      Untuk diisi oleh Pemilik atau Penghuni
                    </p>
                    <Textarea
                      id="remarks"
                      placeholder="Catatan tambahan atau umpan balik dari pemilik/penghuni..."
                      value={formData.remarks}
                      onChange={(e) => handleInputChange('remarks', e.target.value)}
                      rows={3}
                      className="resize-none rounded-lg bg-background/50 transition-all text-base min-h-[80px]"
                    />
                  </div>

                  {/* Mobile-Optimized Signature Section */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Tanda tangan digital</Label>
                    <p className="text-xs text-muted-foreground">
                      Gunakan jari atau stylus untuk menggambar tanda tangan
                    </p>
                    <div className="border-2 border-dashed border-blue-300 rounded-lg p-3 sm:p-6 bg-blue-50/30">
                      <canvas
                        ref={canvasRef}
                        className="w-full h-48 sm:h-40 border border-border rounded-lg bg-white/50 transition-all hover:bg-white/80 touch-none select-none"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                      />
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-3 gap-2">
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                          <PenTool className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="text-xs sm:text-sm">Gambar tanda tangan di atas</span>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={clearSignature}
                          className="hover:bg-red-50 hover:text-red-600 hover:border-red-300 text-xs sm:text-sm h-8 sm:h-9"
                        >
                          Hapus
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile-Optimized Submit Section */}
              <div className="pt-4 sm:pt-6">
                <Button 
                  type="button" 
                  disabled={submitStatus === 'loading'}
                  className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 transition-all shadow-lg touch-manipulation"
                  onClick={handleSubmit}
                >
                  {submitStatus === 'loading' ? (
                    <>
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 animate-spin" />
                      <span className="text-sm sm:text-base">Memproses...</span>
                    </>
                  ) : submitStatus === 'success' ? (
                    <>
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                      <span className="text-sm sm:text-base">Berhasil Dikirim!</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                      <span className="text-sm sm:text-base">Kirim Laporan</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TeknisiPage;