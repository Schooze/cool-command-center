
// File: src/types/auth.types.ts (Enhanced)

export interface User {
  id: string;
  username: string;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// 🆕 NEW: IP Status interface
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
}
