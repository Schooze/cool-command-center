// File: src/pages/LoginPage.tsx (fixed version)
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
      setPassword(''); // Clear password on error
    }
  }, [loginError]);

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  // 🔧 FIX: Add event parameter and preventDefault
  const handleSubmit = async (event?: React.FormEvent | React.MouseEvent) => {
    if (event) {
      event.preventDefault(); // Prevent default form submission
      event.stopPropagation(); // Stop event bubbling
    }
    
    if (!username || !password) return;
    
    try {
      await login({ username, password });
    } catch (error) {
      // Error handled by react-query, no need to do anything
      console.log('Login error caught and handled by useAuth');
    }
  };

  // 🔧 FIX: Handle key press properly
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent form submission
      handleSubmit(event);
    }
  };

  const errorMessage = loginError?.message || '';
  const isRateLimited = errorMessage.includes('terkunci') || errorMessage.includes('Rate limit');
  const maxAttemptsReached = attempts >= 5;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
      {/* 🔧 FIX: Wrap in form with proper onSubmit handling */}
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <Card className="w-full shadow-2xl border-0">
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
                    name="username" // 🔧 ADD: Proper form field name
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username"
                    className="pl-10 h-11"
                    disabled={loginLoading || maxAttemptsReached}
                    onKeyDown={handleKeyDown} // 🔧 FIX: Use proper key handler
                    autoComplete="username" // 🔧 ADD: Better UX
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password" // 🔧 ADD: Proper form field name
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    className="pl-10 pr-10 h-11"
                    disabled={loginLoading || maxAttemptsReached}
                    onKeyDown={handleKeyDown} // 🔧 FIX: Use proper key handler
                    autoComplete="current-password" // 🔧 ADD: Better UX
                  />
                  <button
                    type="button" // 🔧 IMPORTANT: Explicit button type
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={loginLoading || maxAttemptsReached}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <Button
                type="submit" // 🔧 FIX: Explicit submit type
                onClick={handleSubmit} // 🔧 KEEP: For click handling
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
              {/* 🔧 ADD: Debug info for development */}
              {process.env.NODE_ENV === 'development' && loginError && (
                <p className="text-xs text-red-500 mt-1">
                  Debug: {loginError.name} - {loginError.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default LoginPage;