// src/pages/TeknisiPage.tsx
import React, { useState } from 'react';
import MainLayout from '@/components/MainLayout';
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
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  Camera,
  Save,
  Send 
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const TeknisiPage: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    deviceId: '',
    issueType: '',
    description: '',
    repairActions: '',
    partsUsed: '',
    timeSpent: '',
    nextMaintenance: '',
    notes: ''
  });

  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('loading');
    
    // Mock API call
    setTimeout(() => {
      console.log('Form submitted:', formData);
      setSubmitStatus('success');
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          deviceId: '',
          issueType: '',
          description: '',
          repairActions: '',
          partsUsed: '',
          timeSpent: '',
          nextMaintenance: '',
          notes: ''
        });
        setSubmitStatus('idle');
      }, 2000);
    }, 1500);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Panel Teknisi</h1>
            <p className="text-muted-foreground">
              Selamat datang, {user?.username}! Kelola maintenance dan perbaikan peralatan.
            </p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Teknisi
          </Badge>
        </div>

        <Separator />

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Task Hari Ini</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">+2 dari kemarin</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Urgent Repairs</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">3</div>
              <p className="text-xs text-muted-foreground">Perlu prioritas</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">12</div>
              <p className="text-xs text-muted-foreground">Minggu ini</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.5h</div>
              <p className="text-xs text-muted-foreground">Per task</p>
            </CardContent>
          </Card>
        </div>

        {/* Maintenance Report Form */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Laporan Maintenance & Perbaikan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="deviceId">ID Perangkat</Label>
                  <Input
                    id="deviceId"
                    placeholder="Contoh: FREEZER-001"
                    value={formData.deviceId}
                    onChange={(e) => handleInputChange('deviceId', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="issueType">Jenis Masalah</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={formData.issueType}
                    onChange={(e) => handleInputChange('issueType', e.target.value)}
                    required
                  >
                    <option value="">Pilih jenis masalah</option>
                    <option value="maintenance">Maintenance Rutin</option>
                    <option value="repair">Perbaikan</option>
                    <option value="emergency">Emergency Repair</option>
                    <option value="inspection">Inspeksi</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi Masalah</Label>
                <Textarea
                  id="description"
                  placeholder="Jelaskan kondisi perangkat dan masalah yang ditemukan..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  required
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="repairActions">Tindakan Perbaikan</Label>
                <Textarea
                  id="repairActions"
                  placeholder="Jelaskan langkah-langkah perbaikan yang dilakukan..."
                  value={formData.repairActions}
                  onChange={(e) => handleInputChange('repairActions', e.target.value)}
                  required
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="partsUsed">Spare Parts Digunakan</Label>
                  <Input
                    id="partsUsed"
                    placeholder="Contoh: Kompressor, Filter, dll"
                    value={formData.partsUsed}
                    onChange={(e) => handleInputChange('partsUsed', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timeSpent">Waktu Pengerjaan (jam)</Label>
                  <Input
                    id="timeSpent"
                    type="number"
                    step="0.5"
                    placeholder="2.5"
                    value={formData.timeSpent}
                    onChange={(e) => handleInputChange('timeSpent', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nextMaintenance">Next Maintenance</Label>
                  <Input
                    id="nextMaintenance"
                    type="date"
                    value={formData.nextMaintenance}
                    onChange={(e) => handleInputChange('nextMaintenance', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Catatan Tambahan</Label>
                <Textarea
                  id="notes"
                  placeholder="Catatan untuk maintenance selanjutnya, rekomendasi, dll..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={2}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <Button 
                  type="submit" 
                  disabled={submitStatus === 'loading'}
                  className="flex-1"
                >
                  {submitStatus === 'loading' ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : submitStatus === 'success' ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Berhasil Disimpan!
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Simpan Laporan
                    </>
                  )}
                </Button>
                
                <Button type="button" variant="outline">
                  <Camera className="h-4 w-4 mr-2" />
                  Upload Foto
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default TeknisiPage;