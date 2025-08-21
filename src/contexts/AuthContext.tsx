// src/contexts/AuthContext.tsx - Enhanced dengan debugging

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/services/authService';
import { User, LoginResponse, IPStatus, AuthContextType, AccountType } from '@/types/auth.types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [ipStatus, setIpStatus] = useState<IPStatus | null>(null);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🚀 Initializing auth...');
      try {
        const token = authService.getToken();
        console.log('🔍 Found token:', !!token);
        
        if (token) {
          console.log('🔍 Fetching current user...');
          const currentUser = await authService.getCurrentUser();
          console.log('🔍 Current user fetched:', currentUser);
          console.log('🔍 User account_type:', currentUser.account_type);
          setUser(currentUser);
        } else {
          console.log('🔍 No token found, user not authenticated');
        }
      } catch (error) {
        console.error('❌ Failed to initialize auth:', error);
        authService.removeToken();
      } finally {
        setLoading(false);
        console.log('✅ Auth initialization complete');
      }
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string): Promise<LoginResponse> => {
    console.log('🔐 AuthContext login attempt for:', username);
    try {
      const response = await authService.login(username, password);
      
      console.log('🔍 LOGIN RESPONSE IN CONTEXT:');
      console.log('- Full response:', response);
      console.log('- Access token:', !!response.access_token);
      console.log('- User object:', response.user);
      console.log('- User account_type:', response.user?.account_type);
      console.log('- User account_type type:', typeof response.user?.account_type);
      
      authService.setToken(response.access_token);
      
      // Set user with validation
      if (response.user) {
        console.log('🔧 Setting user in context:', response.user);
        setUser(response.user);
      } else {
        console.error('❌ No user object in login response');
        throw new Error('Invalid login response: missing user object');
      }
      
      setIpStatus(null);
      
      console.log('✅ AuthContext login successful');
      return response;
    } catch (error) {
      console.error('❌ AuthContext login failed:', error);
      await checkIPStatus();
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    console.log('🚪 AuthContext logout initiated');
    try {
      await authService.logout();
    } catch (error) {
      console.error('❌ Logout error:', error);
    } finally {
      authService.removeToken();
      setUser(null);
      setIpStatus(null);
      console.log('✅ AuthContext logout complete');
    }
  };

  const checkIPStatus = async (): Promise<void> => {
    try {
      const status = await authService.checkIPStatus();
      setIpStatus(status);
    } catch (error) {
      console.error('❌ Failed to check IP status:', error);
    }
  };

  // Enhanced helper methods dengan debugging
  const isAdmin = (): boolean => {
    const result = user?.account_type === 'admin';
    console.log('🔍 isAdmin check:', { user_account_type: user?.account_type, result });
    return result;
  };

  const isTeknisi = (): boolean => {
    const result = user?.account_type === 'teknisi';
    console.log('🔍 isTeknisi check:', { user_account_type: user?.account_type, result });
    return result;
  };

  const isClient = (): boolean => {
    const result = user?.account_type === 'client';
    console.log('🔍 isClient check:', { user_account_type: user?.account_type, result });
    return result;
  };

  // Debug user state changes
  useEffect(() => {
    console.log('🔄 User state changed:', {
      user: user,
      account_type: user?.account_type,
      isAuthenticated: !!user,
      loading
    });
  }, [user, loading]);

  const contextValue: AuthContextType = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    ipStatus,
    checkIPStatus,
    isAdmin,
    isTeknisi,
    isClient,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};