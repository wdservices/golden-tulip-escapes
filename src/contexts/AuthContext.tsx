import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, phone: string, password: string) => Promise<void>;
  logout: () => void;
  setupNavigation: (navigate: (to: string) => void) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // This will be set by the AuthProvider component
  const [navigateFn, setNavigateFn] = useState<((to: string) => void) | null>(null);

  // Check for existing session on initial load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
          // TODO: Validate token with backend
          // For now, we'll just set the token
          setToken(storedToken);
          // Fetch user data if needed
        }
      } catch (err) {
        console.error('Failed to initialize auth:', err);
        localStorage.removeItem('authToken');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Set up navigation function
  const setupNavigation = useCallback((navigate: (to: string) => void) => {
    setNavigateFn(() => navigate);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: Replace with actual API call
      // const response = await authApi.login(email, password);
      // const { user, token } = response.data;
      
      // Mock response for now
      const mockUser = {
        id: '1',
        name: 'Test User',
        email,
        phone: '+1234567890'
      };
      const mockToken = 'mock-jwt-token';
      
      setUser(mockUser);
      setToken(mockToken);
      localStorage.setItem('authToken', mockToken);
      
      // Use the navigation function if available
      if (navigateFn) {
        navigateFn('/booking');
      }
    } catch (err) {
      setError('Invalid email or password');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, phone: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: Replace with actual API call
      // const response = await authApi.register({ name, email, phone, password });
      
      // Mock response for now
      const mockUser = {
        id: '1',
        name,
        email,
        phone
      };
      const mockToken = 'mock-jwt-token';
      
      setUser(mockUser);
      setToken(mockToken);
      localStorage.setItem('authToken', mockToken);
      
      if (navigateFn) {
        navigateFn('/booking');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    if (navigateFn) {
      navigateFn('/');
    }
  }, [navigateFn]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        error,
        login,
        register,
        logout,
        setupNavigation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
