
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (loginError) {
      setAttempts(prev => prev + 1);
      setPassword(''); // Clear password on error
      setIsSubmitting(false); // Reset submitting state
    }
  }, [loginError]);

  // Redirect if authenticated
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  // 🔧 MAIN FIX: Single, comprehensive form submission handler
  const handleLogin = async (event?: React.FormEvent | React.MouseEvent) => {
    // Always prevent default behavior
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Validation
    if (!username.trim() || !password.trim()) {
      console.log('❌ Empty username or password');
      return;
    }
    
    if (isSubmitting || loginLoading) {
      console.log('❌ Already submitting');
      return;
    }
    
    try {
      setIsSubmitting(true);
      console.log('🔐 Login attempt for:', username);
      
      await login({ username: username.trim(), password });
      
      console.log('✅ Login successful');
      // Navigation will be handled by the useAuth hook and Navigate component
      
    } catch (error: any) {
      console.error('❌ Login error:', error.message);
      // Error state is handled by useAuth hook automatically
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Enter key press
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleLogin();
    }
  };

  const errorMessage = loginError?.message || '';
  const isRateLimited = errorMessage.includes('terkunci') || errorMessage.includes('Rate limit');
  const maxAttemptsReached = attempts >= 5;
  const isLoading = loginLoading || isSubmitting;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
      {/* 🔧 CRITICAL: Form with controlled submission */}
      <form 
        onSubmit={handleLogin}
        className="w-full max-w-md"
        noValidate
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
            {/* Error Display */}
            {errorMessage && (
              <Alert variant={isRateLimited ? "destructive" : "default"} className="border-l-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="font-medium">
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-4">
              {/* Username Field */}
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
                    onKeyDown={handleKeyDown}
                    placeholder="Masukkan username"
                    className="pl-10 h-11"
                    disabled={isLoading || maxAttemptsReached}
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                  />
                </div>
              </div>
              
              {/* Password Field */}
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
                    onKeyDown={handleKeyDown}
                    placeholder="Masukkan password"
                    className="pl-10 pr-10 h-11"
                    disabled={isLoading || maxAttemptsReached}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowPassword(!showPassword);
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isLoading || maxAttemptsReached}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              {/* Submit Button */}
              <Button
                type="submit"
                onClick={handleLogin}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700"
                disabled={isLoading || maxAttemptsReached || !username.trim() || !password.trim()}
              >
                {isLoading ? (
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