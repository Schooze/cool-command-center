import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import { User, LoginResponse, IPStatus } from '@/types/auth.types';

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
    staleTime: 5 * 60 * 1000,
  });

  // 🆕 NEW: IP Status query
  const {
    data: ipStatus,
    refetch: refetchIPStatus
  } = useQuery<IPStatus | null>({
    queryKey: ['ipStatus'],
    queryFn: async () => {
      try {
        return await authService.checkIPStatus();
      } catch (error) {
        console.log('❌ Failed to check IP status:', error);
        return null;
      }
    },
    retry: false,
    refetchInterval: (data) => {
      // Auto-refetch if IP is blocked to update countdown
      return data?.is_blocked ? 1000 : false;
    },
    staleTime: 0, // Always fresh for accurate countdown
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
      
      // Reset IP status after successful login
      queryClient.setQueryData(['ipStatus'], null);
      refetchIPStatus();
    },
    onError: (error: any) => {
      console.error('❌ Login mutation failed:', error.message);
      
      // Refresh IP status after failed login to get updated attempt count
      refetchIPStatus();
    },
    retry: false,
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
      queryClient.setQueryData(['ipStatus'], null);
      queryClient.clear();
    },
    onError: (error: any) => {
      console.error('❌ Logout error:', error.message);
    }
  });

  const login = async (credentials: { username: string; password: string }) => {
    try {
      console.log('🚀 Starting login process...');
      const result = await loginMutation.mutateAsync(credentials);
      console.log('✅ Login process completed successfully');
      return result;
    } catch (error: any) {
      console.error('❌ Login process failed:', error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🚀 Starting logout process...');
      await logoutMutation.mutateAsync();
      console.log('✅ Logout process completed');
    } catch (error: any) {
      console.error('❌ Logout process failed:', error.message);
    }
  };

  const checkIPStatus = async () => {
    await refetchIPStatus();
  };

  return {
    user,
    isAuthenticated: !!user,
    loading: isLoading,
    login,
    logout,
    loginError: loginMutation.error,
    loginLoading: loginMutation.isPending,
    loginStatus: loginMutation.status,
    logoutLoading: logoutMutation.isPending,
    // 🆕 NEW: IP Status features
    ipStatus,
    checkIPStatus,
  };
};
