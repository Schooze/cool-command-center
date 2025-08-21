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
  Award,
  Snowflake,
  AlertTriangle,
  Thermometer,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const TechnicianDashboard: React.FC = () => {
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

  // Update form data when user changes
  useEffect(() => {
    if (user?.username) {
      setFormData(prev => ({
        ...prev,
        maintenanceWorkerName: user.username
      }));
    }
  }, [user?.username]);

  // Initialize canvas for signature
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = 200;
    
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
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

  // Signature drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

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
    
    const canvas = canvasRef.current;
    const signatureData = canvas ? canvas.toDataURL() : '';
    
    const finalFormData = {
      ...formData,
      ownerSignature: signatureData
    };
    
    setTimeout(() => {
      console.log('Form submitted:', finalFormData);
      setSubmitStatus('success');
      
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
    <div className="min-h-screen bg-gradient-to-br from-background to-blue-50">
      {/* Modern Header */}
      <header className="border-b border-border/30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-6 md:gap-10">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-2 rounded-lg">
                <Snowflake className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Koronka IoT Dashboard
                </h1>
                <p className="text-xs text-muted-foreground">Panel Teknisi - Pendingin Daging</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-1 items-center justify-end space-x-4">
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
              <User className="h-3 w-3 mr-1" />
              {user?.username || 'Teknisi'}
            </Badge>
            <Badge variant="outline" className="border-green-500/50 text-green-600 bg-green-50">
              <Activity className="h-3 w-3 mr-1" />
              Online
            </Badge>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container py-8">
        <div className="space-y-2 mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Selamat datang, {user?.username || 'Teknisi'}! ❄️
          </h2>
          <p className="text-muted-foreground text-lg">
            Lengkapi laporan maintenance dan perbaikan peralatan pendingin daging dengan presisi profesional.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 mb-8">
          <Card className="bg-white/95 backdrop-blur border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Snowflake className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">12</p>
                  <p className="text-xs text-muted-foreground">Perangkat Hari Ini</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/95 backdrop-blur border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">9</p>
                  <p className="text-xs text-muted-foreground">Operasional</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/95 backdrop-blur border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">3</p>
                  <p className="text-xs text-muted-foreground">Maintenance</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/95 backdrop-blur border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-cyan-100 rounded-lg">
                  <Thermometer className="h-4 w-4 text-cyan-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">-18°C</p>
                  <p className="text-xs text-muted-foreground">Suhu Rata-rata</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Form */}
        <Card className="bg-white/95 backdrop-blur border-0 shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-2 rounded-lg">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  Laporan Maintenance Pendingin
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Lengkapi laporan maintenance dan inspeksi peralatan pendingin daging komersial
                </p>
              </div>
              <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50">
                <Shield className="h-3 w-3 mr-1" />
                Form Aman
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-8">
              {/* Work Details Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2">
                  <Settings className="h-4 w-4 text-blue-600" />
                  <h3 className="text-lg font-semibold">Detail Pekerjaan</h3>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="workUnderWarranty" className="text-sm font-medium">
                      Pekerjaan dalam garansi
                    </Label>
                    <select
                      id="workUnderWarranty"
                      className="flex h-11 w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                      className="flex h-11 w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                    placeholder="Jelaskan pekerjaan yang dilakukan, masalah yang ditemukan, atau komentar tentang kunjungan..."
                    value={formData.workPerformed}
                    onChange={(e) => handleInputChange('workPerformed', e.target.value)}
                    required
                    rows={4}
                    className="resize-none rounded-lg bg-background/50 transition-all"
                  />
                </div>
              </div>

              <Separator className="bg-border/50" />

              {/* Technician Details Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <h3 className="text-lg font-semibold">Informasi Teknisi</h3>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="maintenanceWorkerName" className="text-sm font-medium">
                      Nama pekerja maintenance
                    </Label>
                    <div className="relative">
                      <Input
                        id="maintenanceWorkerName"
                        value={formData.maintenanceWorkerName}
                        onChange={(e) => handleInputChange('maintenanceWorkerName', e.target.value)}
                        className="bg-muted/30 rounded-lg h-11"
                        readOnly
                      />
                      <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
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
                        className="bg-muted/30 rounded-lg h-11"
                        readOnly
                      />
                      <Calendar className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-border/50" />

              {/* Owner/Resident Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <h3 className="text-lg font-semibold">Bagian Pemilik/Penghuni</h3>
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
                    className="resize-none rounded-lg bg-background/50 transition-all"
                  />
                </div>

                {/* Signature Section */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Tanda tangan digital</Label>
                  <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 bg-blue-50/30">
                    <canvas
                      ref={canvasRef}
                      className="w-full h-48 border border-border rounded-lg cursor-crosshair bg-white/50 transition-all hover:bg-white/80"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                    />
                    <div className="flex justify-between items-center mt-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <PenTool className="h-4 w-4" />
                        Gambar tanda tangan Anda di atas
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={clearSignature}
                        className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                      >
                        Hapus
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ownerName" className="text-sm font-medium">
                      Nama pemilik/penghuni
                    </Label>
                    <Input
                      id="ownerName"
                      placeholder="Masukkan nama lengkap"
                      value={formData.ownerName}
                      onChange={(e) => handleInputChange('ownerName', e.target.value)}
                      className="rounded-lg h-11 bg-background/50"
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
                        className="bg-muted/30 rounded-lg h-11"
                        readOnly
                      />
                      <Calendar className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Section */}
              <div className="pt-6">
                <Button 
                  type="button" 
                  disabled={submitStatus === 'loading'}
                  className="w-full h-14 text-lg font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 transition-all shadow-lg"
                  onClick={handleSubmit}
                >
                  {submitStatus === 'loading' ? (
                    <>
                      <Clock className="h-5 w-5 mr-3 animate-spin" />
                      Memproses Laporan...
                    </>
                  ) : submitStatus === 'success' ? (
                    <>
                      <CheckCircle className="h-5 w-5 mr-3" />
                      Laporan Berhasil Dikirim!
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-3" />
                      Kirim Laporan Maintenance
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TechnicianDashboard;