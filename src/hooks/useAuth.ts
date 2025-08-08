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
      } catch {
        authService.removeToken();
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const loginMutation = useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      authService.login(username, password),
    onSuccess: (data: LoginResponse) => {
      authService.setToken(data.access_token);
      queryClient.setQueryData(['currentUser'], data.user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      authService.removeToken();
      queryClient.setQueryData(['currentUser'], null);
      queryClient.clear();
    },
  });

  return {
    user,
    isAuthenticated: !!user,
    loading: isLoading,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    loginError: loginMutation.error,
    loginLoading: loginMutation.isPending,
  };
};