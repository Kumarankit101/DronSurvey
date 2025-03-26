import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

// User type definition
export interface User {
  id: number;
  username: string;
  role: string;
  name?: string | null;
  email?: string | null;
}

// Authentication context state definition
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

// Register data type
interface RegisterData {
  username: string;
  password: string;
  email?: string;
  name?: string;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  error: null
});

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await apiRequest<{ user: User }>({
          url: '/api/auth/me',
          method: 'GET'
        });
        
        if (response) {
          setUser(response.user);
        }
      } catch (error) {
        // User is not authenticated - this is expected for new users
        console.log('Not authenticated');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login handler
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest<{ user: User }>({
        url: '/api/auth/login',
        method: 'POST',
        data: { username, password }
      });
      
      if (response) {
        setUser(response.user);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Register handler
  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest<{ user: User }>({
        url: '/api/auth/register',
        method: 'POST',
        data: userData
      });
      
      if (response) {
        setUser(response.user);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout handler
  const logout = async () => {
    setIsLoading(true);
    
    try {
      await apiRequest({
        url: '/api/auth/logout',
        method: 'POST'
      });
      
      setUser(null);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Logout failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    error
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};