import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { 
  AuthState, 
  AuthContextType, 
  LoginCredentials, 
  User, 
  UserRole, 
  Permission,
  ROLE_PERMISSIONS 
} from './types';

// Initial Auth State
const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Auth Actions
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

// Auth Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Mock Authentication Service (replace with real API)
const mockAuthService = {
  async login(credentials: LoginCredentials): Promise<User> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock user data based on credentials
    const mockUsers: Record<string, User> = {
      'operator': {
        id: '1',
        username: 'operator',
        email: 'operator@security.com',
        firstName: 'Security',
        lastName: 'Operator',
        role: UserRole.SECURITY_OPERATOR,
        permissions: ROLE_PERMISSIONS[UserRole.SECURITY_OPERATOR],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      'admin': {
        id: '2',
        username: 'admin',
        email: 'admin@security.com',
        firstName: 'System',
        lastName: 'Administrator',
        role: UserRole.ADMINISTRATOR,
        permissions: ROLE_PERMISSIONS[UserRole.ADMINISTRATOR],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    const user = mockUsers[credentials.username];
    if (!user || credentials.password !== 'password') {
      throw new Error('Invalid credentials');
    }

    return user;
  },

  async getCurrentUser(): Promise<User | null> {
    const storedUser = localStorage.getItem('security_user');
    return storedUser ? JSON.parse(storedUser) : null;
  },

  logout(): void {
    localStorage.removeItem('security_user');
    localStorage.removeItem('security_token');
  }
};

// Auth Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, dispatch] = useReducer(authReducer, initialAuthState);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const user = await mockAuthService.getCurrentUser();
        if (user) {
          dispatch({ type: 'LOGIN_SUCCESS', payload: user });
        } else {
          dispatch({ type: 'LOGOUT' });
        }
      } catch (error) {
        dispatch({ type: 'LOGOUT' });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const user = await mockAuthService.login(credentials);
      localStorage.setItem('security_user', JSON.stringify(user));
      localStorage.setItem('security_token', 'mock_token_' + user.id);
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: error instanceof Error ? error.message : 'Login failed' 
      });
    }
  };

  // Logout function
  const logout = (): void => {
    mockAuthService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  // Permission checking functions
  const hasPermission = (permission: Permission): boolean => {
    return authState.user?.permissions.includes(permission) ?? false;
  };

  const hasRole = (role: UserRole): boolean => {
    return authState.user?.role === role;
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const contextValue: AuthContextType = {
    authState,
    login,
    logout,
    hasPermission,
    hasRole,
    hasAnyPermission,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};