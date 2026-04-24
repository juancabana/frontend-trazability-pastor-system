import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useLogin } from '@/features/auth/presentation/hooks/use-auth-mutations';
import { STORAGE_KEYS, DEFAULT_REPORT_DEADLINE_DAY } from '@/constants/shared';
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
  reportDeadlineDay: number;
  mustChangePassword: boolean;
  canEditAllReports: boolean;
}

interface LoginResult {
  role: UserRole;
  mustChangePassword: boolean;
}

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  currentUser: AuthUser | null;
  role: UserRole | null;
  login: (email: string, password: string) => Promise<LoginResult | null>;
  logout: () => void;
  hasAccess: (section: string) => boolean;
  clearMustChangePassword: () => void;
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
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          setToken(null);
          setCurrentUser(null);
          return;
        }
      } catch {
        setToken(null);
        setCurrentUser(null);
        return;
      }
    }
  }, []);

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
    async (email: string, password: string): Promise<LoginResult | null> => {
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
          reportDeadlineDay: res.reportDeadlineDay ?? DEFAULT_REPORT_DEADLINE_DAY,
          mustChangePassword: res.mustChangePassword,
          canEditAllReports: res.canEditAllReports ?? false,
        });
        return { role: res.role, mustChangePassword: res.mustChangePassword };
      } catch {
        return null;
      }
    },
    [loginMutation],
  );

  const clearMustChangePassword = useCallback(() => {
    setCurrentUser((prev) => {
      if (!prev) return prev;
      return { ...prev, mustChangePassword: false };
    });
  }, []);

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
        clearMustChangePassword,
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
