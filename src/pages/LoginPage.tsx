// File: src/pages/LoginPage.tsx (FIXED VERSION)
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

  // 🔧 FIX 1: Unified form submission handler
  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // 🚨 CRITICAL: Prevent browser default form submission
    event.stopPropagation(); // Stop event bubbling
    
    // Validate inputs
    if (!username || !password) return;
    
    try {
      console.log('🔐 Attempting login for:', username);
      await login({ username, password });
    } catch (error) {
      // Error is handled by useAuth hook through react-query
      console.log('Login error handled by useAuth:', error);
    }
  };

  // 🔧 FIX 2: Separate button click handler (for compatibility)
  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); // Prevent any default behavior
    
    // Create a synthetic form event and call the form handler
    const form = event.currentTarget.closest('form');
    if (form) {
      const formEvent = new Event('submit', { cancelable: true, bubbles: true }) as any;
      formEvent.preventDefault = () => {}; // Mock preventDefault
      formEvent.stopPropagation = () => {}; // Mock stopPropagation
      handleFormSubmit({ 
        preventDefault: () => {}, 
        stopPropagation: () => {},
        currentTarget: form 
      } as any);
    }
  };

  // 🔧 FIX 3: Proper keyboard event handling
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent default Enter behavior
      
      // Find the form and submit it properly
      const form = event.currentTarget.closest('form');
      if (form) {
        handleFormSubmit({ 
          preventDefault: () => {}, 
          stopPropagation: () => {},
          currentTarget: form 
        } as any);
      }
    }
  };

  const errorMessage = loginError?.message || '';
  const isRateLimited = errorMessage.includes('terkunci') || errorMessage.includes('Rate limit');
  const maxAttemptsReached = attempts >= 5;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
      {/* 🔧 FIX 4: Proper form element with controlled submission */}
      <form 
        onSubmit={handleFormSubmit}
        className="w-full max-w-md"
        noValidate // Prevent browser validation to control our own
      >
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
                    name="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={handleKeyPress} // 🔧 FIX: Proper key handling
                    placeholder="Masukkan username"
                    className="pl-10 h-11"
                    disabled={loginLoading || maxAttemptsReached}
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyPress} // 🔧 FIX: Proper key handling
                    placeholder="Masukkan password"
                    className="pl-10 pr-10 h-11"
                    disabled={loginLoading || maxAttemptsReached}
                    autoComplete="current-password"
                  />
                  <button
                    type="button" // 🚨 CRITICAL: Explicit button type to prevent form submission
                    onClick={(e) => {
                      e.preventDefault(); // Prevent any form interaction
                      setShowPassword(!showPassword);
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={loginLoading || maxAttemptsReached}
                    tabIndex={-1} // Remove from tab order
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              {/* 🔧 FIX 5: Proper submit button */}
              <Button
                type="submit"
                onClick={handleButtonClick} // Backup click handler
                className="w-full h-11 bg-blue-600 hover:bg-blue-700"
                disabled={loginLoading || maxAttemptsReached || !username.trim() || !password.trim()}
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
              {/* Debug info for development */}
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