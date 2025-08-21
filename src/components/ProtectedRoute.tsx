// src/components/auth/ProtectedRoute.tsx - Updated with Role Support
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
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role permissions if specified
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.account_type)) {
      // Redirect based on user role to their appropriate home page
      switch (user.account_type) {
        case 'admin':
          return <Navigate to="/dashboard" replace />;
        case 'teknisi':
          return <Navigate to="/teknisi" replace />;
        case 'client':
          return <Navigate to="/client" replace />;
        default:
          return <Navigate to="/unauthorized" replace />;
      }
    }
  }

  // User is authenticated and has required permissions
  return <>{children}</>;
};