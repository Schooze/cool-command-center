// src/components/RoleBasedRedirect.tsx
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

/**
 * Component that redirects users to appropriate page based on their role
 * Used for root path "/" and after login
 */
const RoleBasedRedirect: React.FC = () => {
  const { user, loading, isAuthenticated } = useAuth();

  // Show loading while checking authentication
  if (loading) {
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
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role
  switch (user.account_type) {
    case 'admin':
      return <Navigate to="/dashboard" replace />;
    case 'teknisi':
      return <Navigate to="/teknisi" replace />;
    case 'client':
      return <Navigate to="/client" replace />;
    default:
      // Fallback for unknown roles
      return <Navigate to="/unauthorized" replace />;
  }
};

export default RoleBasedRedirect;