import { createContext, useContext } from 'react';

export interface User {
  userId: string;
  username: string;
  pumpMasterId: string;
  role: string;
  mobileNumber: string;
  enabled: boolean;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

// Global reference to logout function for API interceptor
let globalLogout: (() => void) | null = null;

export function setGlobalLogout(logoutFn: () => void) {
  globalLogout = logoutFn;
}

export function handleTokenExpiration() {
  if (globalLogout) {
    globalLogout();
  }
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
