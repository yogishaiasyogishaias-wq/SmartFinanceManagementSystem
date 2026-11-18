import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '@smart-finance/shared';

interface AuthContextType {
  user: UserProfile | null;
  agentCode: string;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
}

const defaultAgent: UserProfile = {
  id: '00000000-0000-0000-0000-000000000003',
  email: 'agent.kumar@smartfinance.com',
  fullName: 'Kumar Velu',
  phone: '9840334455',
  role: 'collection_agent',
  isActive: true,
  createdAt: '2026-10-01T00:00:00Z',
  updatedAt: '2026-10-01T00:00:00Z',
};

const AuthContext = createContext<AuthContextType>({
  user: defaultAgent,
  agentCode: 'AGT-001',
  role: 'collection_agent',
  isAuthenticated: true,
  login: async () => true,
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(defaultAgent);
  const [agentCode, setAgentCode] = useState('AGT-001');

  const login = async (email: string, chosenRole: UserRole = 'collection_agent') => {
    setUser({
      id: '00000000-0000-0000-0000-000000000003',
      email,
      fullName: 'Kumar Velu',
      phone: '9840334455',
      role: chosenRole,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setAgentCode('AGT-001');
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        agentCode,
        role: user?.role || 'collection_agent',
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

