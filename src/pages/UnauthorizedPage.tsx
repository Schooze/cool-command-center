// src/pages/UnauthorizedPage.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Shield, ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleGoHome = () => {
    // Redirect to appropriate home based on role
    switch (user?.account_type) {
      case 'admin':
        navigate('/dashboard');
        break;
      case 'teknisi':
        navigate('/teknisi');
        break;
      case 'client':
        navigate('/client');
        break;
      default:
        navigate('/login');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Akses Ditolak
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Anda tidak memiliki izin untuk mengakses halaman ini.
          </p>
          
          {user && (
            <div className="bg-gray-100 p-3 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>User:</strong> {user.username}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Role:</strong> {user.account_type}
              </p>
            </div>
          )}
          
          <div className="flex flex-col gap-3 pt-4">
            <Button onClick={handleGoHome} className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Kembali ke Halaman Utama
            </Button>
            
            <Button variant="outline" onClick={() => navigate(-1)} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            
            <Button variant="ghost" onClick={handleLogout} className="w-full">
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnauthorizedPage;