import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, User } from '@/lib/auth';
import { wsService } from '@/lib/websocket';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (walletAddress: string, signature: string, message: string, twoFactorToken?: string) => Promise<void>;
  register: (walletAddress: string, signature: string, message: string, email?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);

    // Set up auth change listener
    const unsubscribe = authService.onAuthChange((newUser) => {
      setUser(newUser);
      
      // Connect/disconnect WebSocket based on auth state
      if (newUser) {
        const token = localStorage.getItem('auth_token');
        if (token) {
          wsService.connect(token);
        }
      } else {
        wsService.disconnect();
      }
    });

    // Connect WebSocket if user is already authenticated
    if (currentUser) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        wsService.connect(token);
      }
    }

    return unsubscribe;
  }, []);

  const login = async (walletAddress: string, signature: string, message: string, twoFactorToken?: string) => {
    setIsLoading(true);
    try {
      await authService.login(walletAddress, signature, message, twoFactorToken);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (walletAddress: string, signature: string, message: string, email?: string) => {
    setIsLoading(true);
    try {
      await authService.register(walletAddress, signature, message, email);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    await authService.refreshProfile();
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};