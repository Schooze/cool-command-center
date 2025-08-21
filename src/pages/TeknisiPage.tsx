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

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = 200;
    
    // Set drawing styles
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

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

  const handleLogout = () => {
    logout();
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

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Selamat datang, {user?.username}!
          </h2>
          <p className="text-gray-600">
            Lengkapi laporan maintenance dan perbaikan peralatan pendingin daging.
          </p>
        </div>

        {/* Maintenance Report Form */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Maintenance Report Form
            </CardTitle>
            <p className="text-sm text-gray-600">
              Silakan lengkapi formulir laporan kunjungan maintenance
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Work Under Warranty */}
              <div className="space-y-2">
                <Label htmlFor="workUnderWarranty">Work under warranty</Label>
                <select
                  id="workUnderWarranty"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={formData.workUnderWarranty}
                  onChange={(e) => handleInputChange('workUnderWarranty', e.target.value)}
                  required
                >
                  <option value="">Select option</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              {/* Outcome of the visit */}
              <div className="space-y-2">
                <Label htmlFor="visitOutcome">Outcome of the visit</Label>
                <select
                  id="visitOutcome"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={formData.visitOutcome}
                  onChange={(e) => handleInputChange('visitOutcome', e.target.value)}
                  required
                >
                  <option value="">Select outcome</option>
                  <option value="issued_closed">Issued closed</option>
                  <option value="inspected_will_return">Inspected and will come back for repairs</option>
                </select>
              </div>

              {/* Work performed or comments */}
              <div className="space-y-2">
                <Label htmlFor="workPerformed">Work performed or comments from the visit</Label>
                <Textarea
                  id="workPerformed"
                  placeholder="Describe the work performed or comments about the visit..."
                  value={formData.workPerformed}
                  onChange={(e) => handleInputChange('workPerformed', e.target.value)}
                  required
                  rows={4}
                />
              </div>

              {/* Maintenance worker name (auto-filled) */}
              <div className="space-y-2">
                <Label htmlFor="maintenanceWorkerName">Name of the maintenance worker</Label>
                <div className="relative">
                  <Input
                    id="maintenanceWorkerName"
                    value={formData.maintenanceWorkerName}
                    onChange={(e) => handleInputChange('maintenanceWorkerName', e.target.value)}
                    className="bg-gray-50"
                    readOnly
                  />
                  <User className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Date and time (auto-filled) */}
              <div className="space-y-2">
                <Label htmlFor="visitDateTime">Date and Time</Label>
                <div className="relative">
                  <Input
                    id="visitDateTime"
                    type="datetime-local"
                    value={formData.visitDateTime}
                    onChange={(e) => handleInputChange('visitDateTime', e.target.value)}
                    className="bg-gray-50"
                    readOnly
                  />
                  <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <Separator />

              {/* Remarks */}
              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <p className="text-sm text-gray-500 italic">
                  To be completed by the Owner or Resident
                </p>
                <Textarea
                  id="remarks"
                  placeholder="Remarks from owner or resident..."
                  value={formData.remarks}
                  onChange={(e) => handleInputChange('remarks', e.target.value)}
                  rows={3}
                />
              </div>

              {/* Signature of owner/resident */}
              <div className="space-y-2">
                <Label>Signature of the owner or resident</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-48 border border-gray-200 rounded cursor-crosshair bg-white"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <PenTool className="h-4 w-4" />
                      Draw signature above
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={clearSignature}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </div>

              {/* Name of owner/resident */}
              <div className="space-y-2">
                <Label htmlFor="ownerName">Name of the owner or resident</Label>
                <Input
                  id="ownerName"
                  placeholder="Enter owner or resident name"
                  value={formData.ownerName}
                  onChange={(e) => handleInputChange('ownerName', e.target.value)}
                />
              </div>

              {/* Date and time for owner (auto-filled) */}
              <div className="space-y-2">
                <Label htmlFor="ownerDateTime">Date and Time</Label>
                <div className="relative">
                  <Input
                    id="ownerDateTime"
                    type="datetime-local"
                    value={formData.ownerDateTime}
                    onChange={(e) => handleInputChange('ownerDateTime', e.target.value)}
                    className="bg-gray-50"
                    readOnly
                  />
                  <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <Button 
                  type="button" 
                  disabled={submitStatus === 'loading'}
                  className="w-full h-12 text-lg"
                  onClick={handleSubmit}
                >
                  {submitStatus === 'loading' ? (
                    <>
                      <Clock className="h-5 w-5 mr-2 animate-spin" />
                      Submitting Report...
                    </>
                  ) : submitStatus === 'success' ? (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Report Submitted Successfully!
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      Submit Maintenance Report
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