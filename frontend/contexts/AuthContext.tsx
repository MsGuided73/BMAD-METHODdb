'use client';

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import axios from 'axios';

// Get API base URL
const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Types
interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  subscriptionStatus?: string;
}

interface Subscription {
  status: string | null;
  isActive: boolean;
  daysLeftInTrial: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  subscription: Subscription;
}

interface AuthContextType extends AuthState {
  api: {
    register: (userData: any) => Promise<{ user: User; trial: any }>;
    login: (credentials: any) => Promise<{ user: User; subscription: Subscription }>;
    logout: () => Promise<void>;
    updateProfile: (updates: Partial<User>) => Promise<User>;
    refreshSubscriptionStatus: () => Promise<Subscription>;
  };
  dispatch: React.Dispatch<AuthAction>;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string; subscription?: Subscription } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_PROFILE'; payload: Partial<User> }
  | { type: 'UPDATE_SUBSCRIPTION'; payload: Partial<Subscription> };

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth state management
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  subscription: {
    status: null,
    isActive: false,
    daysLeftInTrial: 0
  }
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        subscription: action.payload.subscription || state.subscription,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'LOGOUT':
      return {
        ...initialState,
        loading: false
      };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null
      };
    case 'UPDATE_SUBSCRIPTION':
      return {
        ...state,
        subscription: { ...state.subscription, ...action.payload }
      };
    default:
      return state;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Error boundary for auth operations
  const handleAuthError = (error: any, operation: string) => {
    console.error(`Auth ${operation} error:`, error);
    // Don't break the app, just log the error and continue
    if (error.response?.status === 401) {
      // Clear invalid auth state
      localStorage.removeItem('bmad_token');
      localStorage.removeItem('bmad_user');
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Configure axios defaults
  useEffect(() => {
    const apiUrl = getApiUrl();
    axios.defaults.baseURL = apiUrl;
    
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [state.token]);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        // Check if we're in the browser environment
        if (typeof window === 'undefined') {
          dispatch({ type: 'SET_LOADING', payload: false });
          return;
        }

        const storedToken = localStorage.getItem('bmad_token');
        const storedUser = localStorage.getItem('bmad_user');

        if (storedToken && storedUser) {
          try {
            const user = JSON.parse(storedUser);

            // Verify token is still valid
            const response = await axios.get('/api/auth/me', {
              headers: { Authorization: `Bearer ${storedToken}` }
            });

            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: {
                user: response.data.data.user,
                token: storedToken,
                subscription: response.data.data.subscription
              }
            });
          } catch (error) {
            // Token is invalid or API error, clear storage and continue
            console.warn('Auth token validation failed:', (error as Error).message);
            localStorage.removeItem('bmad_token');
            localStorage.removeItem('bmad_user');
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    // Add a small delay to ensure the component is mounted
    const timer = setTimeout(loadStoredAuth, 100);
    return () => clearTimeout(timer);
  }, []);

  // API functions
  const api = {
    async register(userData: any) {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const response = await axios.post('/api/auth/register', userData);
        const { user, token, trial } = response.data.data;

        // Store in localStorage
        localStorage.setItem('bmad_token', token);
        localStorage.setItem('bmad_user', JSON.stringify(user));

        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user,
            token,
            subscription: {
              status: user.subscriptionStatus,
              isActive: true,
              daysLeftInTrial: trial.daysLeft
            }
          }
        });

        return { user, trial };
      } catch (error) {
        handleAuthError(error, 'registration');
        const message = (error as any).response?.data?.message || 'Registration failed';
        dispatch({ type: 'SET_ERROR', payload: message });
        throw error;
      }
    },

    async login(credentials: any) {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const response = await axios.post('/api/auth/login', credentials);
        const { user, token, subscription } = response.data.data;

        // Store in localStorage
        localStorage.setItem('bmad_token', token);
        localStorage.setItem('bmad_user', JSON.stringify(user));

        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token, subscription }
        });

        return { user, subscription };
      } catch (error) {
        const message = (error as any).response?.data?.message || 'Login failed';
        dispatch({ type: 'SET_ERROR', payload: message });
        throw error;
      }
    },

    async logout() {
      try {
        await axios.post('/api/auth/logout');
      } catch (error) {
        // Continue with logout even if API call fails
        console.error('Logout API error:', error);
      }
      
      // Clear localStorage
      localStorage.removeItem('bmad_token');
      localStorage.removeItem('bmad_user');
      
      dispatch({ type: 'LOGOUT' });
    },

    async updateProfile(updates: Partial<User>) {
      try {
        const response = await axios.put('/api/auth/profile', updates);
        const updatedUser = response.data.data.user;

        // Update localStorage
        localStorage.setItem('bmad_user', JSON.stringify(updatedUser));

        dispatch({ type: 'UPDATE_PROFILE', payload: updatedUser });
        return updatedUser;
      } catch (error) {
        const message = (error as any).response?.data?.message || 'Profile update failed';
        dispatch({ type: 'SET_ERROR', payload: message });
        throw error;
      }
    },

    async refreshSubscriptionStatus() {
      try {
        const response = await axios.get('/api/auth/me');
        const { subscription } = response.data.data;
        
        dispatch({ type: 'UPDATE_SUBSCRIPTION', payload: subscription });
        return subscription;
      } catch (error) {
        console.error('Subscription refresh error:', error);
        return state.subscription;
      }
    }
  };

  // Clear error after 5 seconds
  useEffect(() => {
    if (state.error) {
      const timer = setTimeout(() => {
        dispatch({ type: 'SET_ERROR', payload: null });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [state.error]);

  const value = {
    ...state,
    api,
    dispatch
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
