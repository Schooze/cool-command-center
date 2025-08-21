import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Eye, EyeOff, Lock, User, AlertCircle, Loader2, Snowflake, Clock, Shield } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { login, isAuthenticated, loginLoading, loginError, ipStatus, checkIPStatus } = useAuth();
  const location = useLocation();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/';

  // Check IP status on component mount
  useEffect(() => {
    checkIPStatus();
  }, []);

  useEffect(() => {
    if (loginError) {
      setAttempts(prev => prev + 1);
      setPassword(''); // Clear password on error
      setIsSubmitting(false);
    }
  }, [loginError]);

  // Redirect if authenticated
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleLogin = async (event?: React.FormEvent | React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (!username.trim() || !password.trim()) {
      console.log('❌ Empty username or password');
      return;
    }
    
    if (isSubmitting || loginLoading) {
      console.log('❌ Already submitting');
      return;
    }
    
    // Check IP status before attempting login
    if (ipStatus?.is_blocked) {
      console.log('❌ IP is blocked');
      return;
    }
    
    try {
      setIsSubmitting(true);
      console.log('🔐 Login attempt for:', username);
      
      // await login({ username: username.trim(), password });
      await login(username.trim(), password);
            
      console.log('✅ Login successful');
      
    } catch (error: any) {
      console.error('❌ Login error:', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleLogin();
    }
  };

  // Format countdown time
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const errorMessage = loginError?.message || '';
  const isRateLimited = errorMessage.includes('terkunci') || errorMessage.includes('Rate limit') || errorMessage.includes('cooldown');
  const isLoading = loginLoading || isSubmitting;
  
  // IP Status calculations
  const isIPBlocked = ipStatus?.is_blocked || false;
  const remainingTime = ipStatus?.remaining_time || 0;
  const failedAttempts = ipStatus?.failed_attempts || 0;
  const attemptsLeft = Math.max(0, 3 - failedAttempts);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
      <form 
        onSubmit={handleLogin}
        className="w-full max-w-md"
        noValidate
      >
        <Card className="w-full shadow-2xl border-0">
          <CardHeader className="space-y-3 pb-2">
            <div className="flex justify-center">
                <img
                  src="/koronka_text_clear.png"
                  alt="Logo Koronka"
                  className="h-16 w-auto max-w-[150px] object-contain sm:h-20 md:h-24"
                />
            </div>
            <div className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Koronka Control System
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Freezer Monitoring & Control Panel
              </p>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* 🆕 IP Cooldown Alert */}
            {isIPBlocked && (
              <Alert variant="destructive" className="border-l-4">
                <Clock className="h-4 w-4" />
                <AlertDescription className="space-y-3">
                  <div className="font-medium">
                    IP Address dalam Cooldown
                  </div>
                  <div className="text-sm">
                    Terlalu banyak percobaan login gagal. Tunggu {formatTime(remainingTime)} lagi.
                  </div>
                  <div className="space-y-2">
                    <Progress 
                      value={(1800 - remainingTime) / 1800 * 100} 
                      className="w-full h-2"
                    />
                    <div className="text-xs text-center">
                      Cooldown berlaku selama 30 menit
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Regular Error Alert */}
            {errorMessage && !isIPBlocked && (
              <Alert variant={isRateLimited ? "destructive" : "default"} className="border-l-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="font-medium">
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}

            {/* 🆕 Attempts Warning */}
            {!isIPBlocked && failedAttempts > 0 && (
              <Alert variant="default" className="border-l-4 border-yellow-500">
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium">Peringatan Keamanan</div>
                  <div className="text-sm mt-1">
                    {failedAttempts} percobaan gagal dari IP ini. {attemptsLeft} percobaan tersisa sebelum cooldown.
                  </div>
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
                    disabled={isLoading || isIPBlocked}
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
                    disabled={isLoading || isIPBlocked}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowPassword(!showPassword);
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isLoading || isIPBlocked}
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
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                disabled={isLoading || isIPBlocked || !username.trim() || !password.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memverifikasi...
                  </>
                ) : isIPBlocked ? (
                  <>
                    <Clock className="mr-2 h-4 w-4" />
                    Tunggu {formatTime(remainingTime)}
                  </>
                ) : (
                  'Masuk'
                )}
              </Button>
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-xs text-gray-500">
                Sistem keamanan aktif dengan IP cooldown protection
              </p>
              {!isIPBlocked && (
                <p className="text-xs text-gray-600">
                  IP attempts: {failedAttempts}/3 • User attempts: {attempts}/5
                </p>
              )}
              {/* Debug info for development */}
              {/* {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-gray-400 space-y-1">
                  {ipStatus && (
                    <p>IP Status: {JSON.stringify(ipStatus, null, 2)}</p>
                  )}
                  {loginError && (
                    <p className="text-red-500">
                      Debug: {loginError.name} - {loginError.message}
                    </p>
                  )}
                </div>
              )} */}
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default LoginPage;