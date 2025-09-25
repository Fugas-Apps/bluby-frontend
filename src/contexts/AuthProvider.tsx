import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuthStore, AuthState } from '../stores/useAuthStore';

interface AuthContextType extends Omit<AuthState, 'initializeAuth'> {
  // Remove initializeAuth as it's internal to the provider
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const authStore = useAuthStore();

  useEffect(() => {
    // Initialize auth state when the provider mounts
    authStore.initializeAuth();
  }, [authStore.initializeAuth]);

  const contextValue: AuthContextType = {
    user: authStore.user,
    isAuthenticated: authStore.isAuthenticated,
    isLoading: authStore.isLoading,
    error: authStore.error,
    signIn: authStore.signIn,
    signUp: authStore.signUp,
    signOut: authStore.signOut,
    checkAuth: authStore.checkAuth,
    clearError: authStore.clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
