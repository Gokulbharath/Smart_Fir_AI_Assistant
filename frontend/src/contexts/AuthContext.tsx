import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as loginAPI, logout as logoutAPI } from '../api/authService';

// Consistent Role Enum
export type PoliceRole =
  | 'CONSTABLE' | 'HEAD_CONSTABLE' | 'ASI' | 'SI' | 'INSPECTOR'
  | 'DSP' | 'SP' | 'DIG' | 'IG' | 'ADGP' | 'DGP' | 'ADMIN';

export type UserRole = PoliceRole;

export interface User {
  id?: string;
  email: string;
  name: string;
  role: PoliceRole;
  permissions?: string[]; // Added permissions array
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  token: string | null;
  hasPermission: (permission: string) => boolean; // Added helper
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user and token from localStorage on mount
    const savedUser = localStorage.getItem('auth_user');
    const savedToken = localStorage.getItem('auth_token');

    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (error) {
        console.error('Error loading saved auth data:', error);
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await loginAPI({ email, password });

      // Store user and token
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem('auth_user', JSON.stringify(response.user));
      localStorage.setItem('auth_token', response.token);

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await logoutAPI();
    } catch (error) {
      console.error('Logout error:', error);
    }

    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;

    // Direct match
    if (user.permissions?.includes(permission)) return true;

    // Accept lowercase/alternative formats from older UI ('approve_fir')
    const normalized = permission.toUpperCase();
    if (user.permissions?.includes(normalized)) return true;

    // Support swapped order ('approve_fir' -> 'FIR_APPROVE')
    if (permission.includes('_')) {
      const parts = permission.split('_');
      if (parts.length === 2) {
        const swapped = `${parts[1].toUpperCase()}_${parts[0].toUpperCase()}`;
        if (user.permissions?.includes(swapped)) return true;
      }
    }

    return false;
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user && !!token,
      token,
      hasPermission
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};