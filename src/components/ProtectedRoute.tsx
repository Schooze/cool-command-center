// src/components/ProtectedRoute.tsx - Enhanced dengan debugging
// ===================================

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AccountType } from '@/types/auth.types';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AccountType[];
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles,
  redirectTo = '/login' 
}) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Debug current route access
  React.useEffect(() => {
    console.log('🔍 ProtectedRoute check:', {
      path: location.pathname,
      user: user?.username,
      account_type: user?.account_type,
      allowedRoles,
      isAuthenticated,
      loading
    });
  }, [user, allowedRoles, location.pathname, isAuthenticated, loading]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    console.log('🚫 ProtectedRoute: User not authenticated');
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role permissions if specified
  if (allowedRoles && allowedRoles.length > 0) {
    const userAccountType = user.account_type?.toString().toLowerCase().trim() as AccountType;
    const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase().trim());
    
    console.log('🔒 ProtectedRoute permission check:');
    console.log('- User account type:', userAccountType);
    console.log('- Allowed roles:', normalizedAllowedRoles);
    console.log('- Has access:', normalizedAllowedRoles.includes(userAccountType));
    
    if (!normalizedAllowedRoles.includes(userAccountType)) {
      console.log('❌ ProtectedRoute: Access denied, redirecting based on role');
      
      // Redirect based on user role to their appropriate home page
      switch (userAccountType) {
        case 'admin':
          console.log('📍 Redirecting admin to /dashboard');
          return <Navigate to="/dashboard" replace />;
        case 'teknisi':
          console.log('📍 Redirecting teknisi to /teknisi');
          return <Navigate to="/teknisi" replace />;
        case 'client':
          console.log('📍 Redirecting client to /client');
          return <Navigate to="/client" replace />;
        default:
          console.log('📍 Redirecting unknown role to /unauthorized');
          return <Navigate to="/unauthorized" replace />;
      }
    }
  }

  console.log('✅ ProtectedRoute: Access granted');
  return <>{children}</>;
};