// File: src/hooks/useAuth.ts (enhanced error handling)
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import { User, LoginResponse } from '@/types/auth.types';

export const useAuth = () => {
  const queryClient = useQueryClient();
  
  const {
    data: user,
    isLoading,
    error
  } = useQuery<User | null>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const token = authService.getToken();
      if (!token) return null;
      
      try {
        return await authService.getCurrentUser();
      } catch (error) {
        console.log('🔄 Token invalid, removing and returning null');
        authService.removeToken();
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const loginMutation = useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) => {
      console.log('🔐 Login mutation triggered for:', username);
      return authService.login(username, password);
    },
    onSuccess: (data: LoginResponse) => {
      console.log('✅ Login mutation successful:', data.user.username);
      authService.setToken(data.access_token);
      queryClient.setQueryData(['currentUser'], data.user);
    },
    onError: (error: any) => {
      console.error('❌ Login mutation failed:', error.message);
      // 🔧 FIX: Don't redirect or reload on error, just let UI handle it
      // Error will be available through loginMutation.error
    },
    // 🔧 FIX: Add retry configuration
    retry: false, // Don't retry login attempts
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      console.log('🚪 Logout mutation triggered');
      await authService.logout();
    },
    onSettled: () => {
      console.log('🧹 Cleaning up after logout');
      authService.removeToken();
      queryClient.setQueryData(['currentUser'], null);
      queryClient.clear();
    },
    onError: (error: any) => {
      console.error('❌ Logout error:', error.message);
      // Still clean up even if logout request fails
    }
  });

  // 🔧 FIX: Enhanced login function with better error handling
  const login = async (credentials: { username: string; password: string }) => {
    try {
      console.log('🚀 Starting login process...');
      const result = await loginMutation.mutateAsync(credentials);
      console.log('✅ Login process completed successfully');
      return result;
    } catch (error: any) {
      console.error('❌ Login process failed:', error.message);
      // 🔧 IMPORTANT: Don't throw error here, let the UI component handle it
      // through loginMutation.error
      throw error;
    }
  };

  // 🔧 FIX: Enhanced logout function
  const logout = async () => {
    try {
      console.log('🚀 Starting logout process...');
      await logoutMutation.mutateAsync();
      console.log('✅ Logout process completed');
    } catch (error: any) {
      console.error('❌ Logout process failed:', error.message);
      // Don't throw error for logout failures
    }
  };

  return {
    user,
    isAuthenticated: !!user,
    loading: isLoading,
    login,
    logout,
    loginError: loginMutation.error,
    loginLoading: loginMutation.isPending,
    // 🔧 ADD: Additional debugging info
    loginStatus: loginMutation.status,
    logoutLoading: logoutMutation.isPending,
  };
};