import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'officer' | 'inspector' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  rank: string;
  station: string;
  avatar?: string;
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockUsers: Record<string, User> = {
  'officer@police.gov.in': {
    id: '1',
    name: 'Constable Rajesh Kumar',
    email: 'officer@police.gov.in',
    role: 'officer',
    rank: 'Police Constable',
    station: 'Sector 14 Police Station',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
    permissions: ['create_fir', 'view_fir', 'upload_evidence', 'search_cases']
  },
  'inspector@police.gov.in': {
    id: '2',
    name: 'Inspector Priya Sharma',
    email: 'inspector@police.gov.in',
    role: 'inspector',
    rank: 'Police Inspector',
    station: 'Sector 14 Police Station',
    avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
    permissions: ['create_fir', 'view_fir', 'approve_fir', 'reject_fir', 'upload_evidence', 'search_cases', 'view_analytics']
  },
  'admin@police.gov.in': {
    id: '3',
    name: 'Superintendent Anil Verma',
    email: 'admin@police.gov.in',
    role: 'admin',
    rank: 'Superintendent of Police',
    station: 'District Headquarters',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
    permissions: ['create_fir', 'view_fir', 'approve_fir', 'reject_fir', 'upload_evidence', 'search_cases', 'view_analytics', 'manage_users', 'system_settings']
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers[email];
    if (foundUser && password) {
      setUser(foundUser);
      localStorage.setItem('user', JSON.stringify(foundUser));
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const hasPermission = (permission: string): boolean => {
    return user?.permissions.includes(permission) || false;
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated: !!user,
      hasPermission,
      hasRole
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