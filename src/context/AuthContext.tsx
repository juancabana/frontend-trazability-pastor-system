import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useLogin } from '@/features/auth/presentation/hooks/use-auth-mutations';
import { STORAGE_KEYS } from '@/constants/shared';
import type { UserRole } from '@/features/auth/domain/entities/user-role';
import { ROLE_ACCESS } from '@/features/auth/domain/entities/user-role';

interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  associationId: string | null;
  unionId: string | null;
  associationName: string | null;
  unionName: string | null;
}

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  currentUser: AuthUser | null;
  role: UserRole | null;
  login: (email: string, password: string) => Promise<UserRole | null>;
  logout: () => void;
  hasAccess: (section: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  });

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const loginMutation = useLogin();

  useEffect(() => {
    if (token) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    }
  }, [token]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    }
  }, [currentUser]);

  const login = useCallback(
    async (email: string, password: string): Promise<UserRole | null> => {
      try {
        const res = await loginMutation.mutateAsync({ email, password });
        setToken(res.access_token);
        setCurrentUser({
          id: res.userId,
          email: res.email,
          displayName: res.displayName,
          role: res.role,
          associationId: res.associationId,
          unionId: res.unionId,
          associationName: res.associationName ?? null,
          unionName: res.unionName ?? null,
        });
        return res.role;
      } catch {
        return null;
      }
    },
    [loginMutation],
  );

  const logout = useCallback(() => {
    setToken(null);
    setCurrentUser(null);
  }, []);

  const hasAccess = useCallback(
    (section: string): boolean => {
      if (!currentUser) return false;
      return ROLE_ACCESS[currentUser.role]?.includes(section) ?? false;
    },
    [currentUser],
  );

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        currentUser,
        role: currentUser?.role ?? null,
        login,
        logout,
        hasAccess,
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
