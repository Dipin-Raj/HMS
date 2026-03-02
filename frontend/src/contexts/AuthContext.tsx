import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, UserRole, AuthContextType, LoginCredentials } from '@/types/auth';
import { loginUser, getMe } from '@/services/api/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_ROUTES: Record<UserRole, string> = {
  patient: '/patient',
  doctor: '/doctor',
  staff: '/staff',
  admin: '/admin',
  pharmacy: '/pharmacy',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const storedToken = localStorage.getItem('auth_token');
      if (storedToken) {
        try {
          const userData = await getMe(storedToken);
          setUser(userData);
          setToken(storedToken);
        } catch (error) {
          console.error("Session validation failed", error);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
        }
      }
      setIsLoading(false);
    };
    checkLoggedIn();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const tokenData = await loginUser(credentials);
      const { access_token } = tokenData;
      
      const userData = await getMe(access_token);
      
      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('auth_user', JSON.stringify(userData)); // For persistence if needed, though getMe is better
      
      setToken(access_token);
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function getRoleRoute(role: UserRole): string {
  return ROLE_ROUTES[role];
}