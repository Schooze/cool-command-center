// src/contexts/AuthContext.tsx - Updated with account_type support
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
      try {
        const token = authService.getToken();
        if (token) {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        authService.removeToken();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await authService.login(username, password);
      authService.setToken(response.access_token);
      setUser(response.user);
      setIpStatus(null); // Clear IP status on successful login
      return response;
    } catch (error) {
      // Check IP status on failed login
      await checkIPStatus();
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      authService.removeToken();
      setUser(null);
      setIpStatus(null);
    }
  };

  const checkIPStatus = async (): Promise<void> => {
    try {
      const status = await authService.checkIPStatus();
      setIpStatus(status);
    } catch (error) {
      console.error('Failed to check IP status:', error);
    }
  };

  // NEW: Helper methods for role checking
  const isAdmin = (): boolean => {
    return user?.account_type === 'admin';
  };

  const isTeknisi = (): boolean => {
    return user?.account_type === 'teknisi';
  };

  const isClient = (): boolean => {
    return user?.account_type === 'client';
  };

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