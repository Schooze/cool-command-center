// src/contexts/AuthContext.tsx - Fixed Login Parameter Issue
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/services/authService';
import { User, LoginResponse, IPStatus, AuthContextType, AccountType } from '@/types/auth.types';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [ipStatus, setIpStatus] = useState<IPStatus | null>(null);

  // Debug state changes
  useEffect(() => {
    console.log('🔄 AuthContext State Update:', {
      user: user?.username,
      account_type: user?.account_type,
      isAuthenticated: !!user,
      loading
    });
  }, [user, loading]);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🚀 AuthContext: Initializing auth...');
      try {
        const token = authService.getToken();
        console.log('🔍 AuthContext: Found token:', !!token);
        
        if (token) {
          console.log('🔍 AuthContext: Fetching current user...');
          const currentUser = await authService.getCurrentUser();
          console.log('🔍 AuthContext: Current user fetched:', currentUser);
          console.log('🔍 AuthContext: User account_type:', currentUser.account_type);
          setUser(currentUser);
        } else {
          console.log('🔍 AuthContext: No token found, user not authenticated');
        }
      } catch (error) {
        console.error('❌ AuthContext: Failed to initialize auth:', error);
        authService.removeToken();
        setUser(null);
      } finally {
        setLoading(false);
        console.log('✅ AuthContext: Auth initialization complete');
      }
    };

    initializeAuth();
  }, []);

  // 🔧 FIX: Proper parameter handling for login
  const login = async (username: string, password: string): Promise<LoginResponse> => {
    console.log('🔐 AuthContext: Login attempt for:', username); // Fixed: log only username
    setLoading(true);
    
    try {
      // 🔧 FIX: Pass parameters correctly
      const response = await authService.login(username, password);
      
      console.log('🔍 AuthContext: LOGIN RESPONSE RECEIVED:');
      console.log('- Full response:', response);
      console.log('- Access token:', !!response.access_token);
      console.log('- User object:', response.user);
      console.log('- User account_type:', response.user?.account_type);
      console.log('- User account_type type:', typeof response.user?.account_type);
      
      // Set token first
      authService.setToken(response.access_token);
      
      // Set user in state - THIS IS CRITICAL
      if (response.user) {
        console.log('🔧 AuthContext: Setting user in state:', response.user);
        
        // Validate user object before setting
        const validatedUser = {
          ...response.user,
          account_type: response.user.account_type?.toString().toLowerCase().trim() as AccountType
        };
        
        console.log('🔧 AuthContext: Validated user object:', validatedUser);
        setUser(validatedUser);
        
        // Force a small delay to ensure state is updated
        await new Promise(resolve => setTimeout(resolve, 50));
        
        console.log('🔄 AuthContext: User state after login should be updated');
      } else {
        console.error('❌ AuthContext: No user object in login response');
        throw new Error('Invalid login response: missing user object');
      }
      
      setIpStatus(null);
      
      console.log('✅ AuthContext: Login successful, user state updated');
      return response;
    } catch (error) {
      console.error('❌ AuthContext: Login failed:', error);
      await checkIPStatus();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    console.log('🚪 AuthContext: Logout initiated');
    setLoading(true);
    
    try {
      await authService.logout();
    } catch (error) {
      console.error('❌ AuthContext: Logout error:', error);
    } finally {
      authService.removeToken();
      setUser(null);
      setIpStatus(null);
      setLoading(false);
      console.log('✅ AuthContext: Logout complete');
    }
  };

  const checkIPStatus = async (): Promise<void> => {
    try {
      const status = await authService.checkIPStatus();
      setIpStatus(status);
    } catch (error) {
      console.error('❌ AuthContext: Failed to check IP status:', error);
    }
  };

  // Enhanced helper methods dengan debugging
  const isAdmin = (): boolean => {
    const result = user?.account_type === 'admin';
    console.log('🔍 AuthContext: isAdmin check:', { user_account_type: user?.account_type, result });
    return result;
  };

  const isTeknisi = (): boolean => {
    const result = user?.account_type === 'teknisi';
    console.log('🔍 AuthContext: isTeknisi check:', { user_account_type: user?.account_type, result });
    return result;
  };

  const isClient = (): boolean => {
    const result = user?.account_type === 'client';
    console.log('🔍 AuthContext: isClient check:', { user_account_type: user?.account_type, result });
    return result;
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

  console.log('🎯 AuthContext: Providing context value:', {
    hasUser: !!user,
    userAccountType: user?.account_type,
    isAuthenticated: !!user,
    loading
  });

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