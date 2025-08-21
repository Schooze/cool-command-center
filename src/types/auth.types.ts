// File: src/types/auth.types.ts - Updated with account_type

export type AccountType = 'admin' | 'teknisi' | 'client';

export interface User {
  id: string;
  username: string;
  account_type: AccountType;  // NEW FIELD
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface IPStatus {
  is_blocked: boolean;
  remaining_time: number;
  failed_attempts: number;
  cooldown_until: string | null;
  message: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
  ipStatus: IPStatus | null;
  checkIPStatus: () => Promise<void>;
  // NEW: Helper methods for role checking
  isAdmin: () => boolean;
  isTeknisi: () => boolean;
  isClient: () => boolean;
}