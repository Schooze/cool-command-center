import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Lock, User, AlertCircle, Loader2, Snowflake } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { login, isAuthenticated, loginLoading, loginError } = useAuth();
  const location = useLocation();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (loginError) {
      setAttempts(prev => prev + 1);
      setPassword('');
    }
  }, [loginError]);

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async () => {
    if (!username || !password) return;
    
    try {
      await login({ username, password });
    } catch (error) {
      // Error handled by react-query
    }
  };

  const errorMessage = loginError?.message || '';
  const isRateLimited = errorMessage.includes('terkunci') || errorMessage.includes('Rate limit');
  const maxAttemptsReached = attempts >= 5;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="space-y-4 pb-6">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-blue-100">
              <Snowflake className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Koronka Control System
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Sistem Monitoring Pendingin Daging
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {errorMessage && (
            <Alert variant={isRateLimited ? "destructive" : "default"} className="border-l-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-medium">
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="pl-10 h-11"
                  disabled={loginLoading || maxAttemptsReached}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="pl-10 pr-10 h-11"
                  disabled={loginLoading || maxAttemptsReached}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loginLoading || maxAttemptsReached}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <Button
              onClick={handleSubmit}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700"
              disabled={loginLoading || maxAttemptsReached || !username || !password}
            >
              {loginLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memverifikasi...
                </>
              ) : (
                'Masuk'
              )}
            </Button>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Sistem keamanan aktif. Login attempts: {attempts}/5
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;