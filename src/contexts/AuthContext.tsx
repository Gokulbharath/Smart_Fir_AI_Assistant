import React, { createContext, useContext, useState } from 'react';

interface Officer {
  id: string;
  name: string;
  email: string;
  rank: string;
  station: string;
  avatar?: string;
}

interface AuthContextType {
  officer: Officer | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [officer, setOfficer] = useState<Officer | null>(null);

  const login = async (email: string, password: string) => {
    // Simulate login - replace with actual API call
    if (email && password) {
      setOfficer({
        id: '1',
        name: 'Inspector Rajesh Kumar',
        email: email,
        rank: 'Inspector',
        station: 'Sector 14 Police Station',
        avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
      });
    }
  };

  const logout = () => {
    setOfficer(null);
  };

  return (
    <AuthContext.Provider value={{ 
      officer, 
      login, 
      logout, 
      isAuthenticated: !!officer 
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