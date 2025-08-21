// src/components/RoleBasedRedirect.tsx - Complete Fixed Version
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * Component that redirects users to appropriate page based on their role
 * Used for root path "/" and after login
 */
const RoleBasedRedirect: React.FC = () => {
  const { user, loading, isAuthenticated } = useAuth();

  // Enhanced debugging
  useEffect(() => {
    console.log('🔍 RoleBasedRedirect - State Update:');
    console.log('- Loading:', loading);
    console.log('- Authenticated:', isAuthenticated);
    console.log('- User:', user);
    console.log('- User account_type:', user?.account_type);
    console.log('- Account type typeof:', typeof user?.account_type);
    
    if (user?.account_type) {
      console.log('🔍 Account type analysis:');
      console.log('- Original value:', `"${user.account_type}"`);
      console.log('- Length:', user.account_type.length);
      console.log('- Trimmed:', `"${user.account_type.trim()}"`);
      console.log('- Lowercase:', `"${user.account_type.toLowerCase()}"`);
      console.log('- Normalized:', `"${user.account_type.toString().toLowerCase().trim()}"`);
      
      // Test each case
      console.log('🔍 Role comparison tests:');
      console.log('- Is "admin":', user.account_type === 'admin');
      console.log('- Is "teknisi":', user.account_type === 'teknisi');
      console.log('- Is "client":', user.account_type === 'client');
      console.log('- Normalized is "admin":', user.account_type.toString().toLowerCase().trim() === 'admin');
      console.log('- Normalized is "teknisi":', user.account_type.toString().toLowerCase().trim() === 'teknisi');
      console.log('- Normalized is "client":', user.account_type.toString().toLowerCase().trim() === 'client');
    }
  }, [user, loading, isAuthenticated]);

  // Show loading while checking authentication
  if (loading) {
    console.log('🔄 RoleBasedRedirect: Showing loading state');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Mengalihkan...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    console.log('🚫 RoleBasedRedirect: User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Enhanced role-based redirect dengan normalisasi
  const accountType = user.account_type?.toString().toLowerCase().trim();
  
  console.log('🚦 RoleBasedRedirect: Processing redirect');
  console.log('- Original account_type:', user.account_type);
  console.log('- Normalized account_type:', accountType);
  console.log('- About to switch on:', accountType);

  // Redirect based on normalized user role
  switch (accountType) {
    case 'admin':
      console.log('📍 RoleBasedRedirect: Redirecting ADMIN to /dashboard');
      return <Navigate to="/dashboard" replace />;
    case 'teknisi':
      console.log('📍 RoleBasedRedirect: Redirecting TEKNISI to /teknisi');
      return <Navigate to="/teknisi" replace />;
    case 'client':
      console.log('📍 RoleBasedRedirect: Redirecting CLIENT to /client');
      return <Navigate to="/client" replace />;
    default:
      console.error('❌ RoleBasedRedirect: Unknown account type');
      console.log('- Original value:', user.account_type);
      console.log('- Normalized value:', accountType);
      console.log('- Type:', typeof user.account_type);
      console.log('📍 Redirecting to /unauthorized');
      return <Navigate to="/unauthorized" replace />;
  }
};

export default RoleBasedRedirect;