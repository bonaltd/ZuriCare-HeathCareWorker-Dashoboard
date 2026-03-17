import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

type User = {
  id: string;
  email: string;
  fullName: string;
  clinicName: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('zuricare_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { user: u } = await api.auth.me();
      setUser(u);
    } catch {
      localStorage.removeItem('zuricare_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user: u } = await api.auth.login(email, password);
    localStorage.setItem('zuricare_token', token);
    setUser(u);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch {
      // ignore
    }
    localStorage.removeItem('zuricare_token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
