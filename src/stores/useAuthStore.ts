import { create } from 'zustand';
import { authClient } from '../lib/authClient';

export interface User {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  signIn: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      console.log('🔐 Attempting login with:', { email });
      const resp = await authClient.signIn.email({ email, password });
      console.log('🔐 Login result:', resp);

      if (resp.data?.user) {
        set({
          user: resp.data.user,
          isAuthenticated: true,
          isLoading: false
        });
        console.log('✅ Login successful');
      } else if (resp.error) {
        set({ error: resp.error.message || 'Login failed', isLoading: false });
        console.log('❌ Login error:', resp.error);
        throw new Error(resp.error.message || 'Login failed');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      set({ error: message, isLoading: false });
      console.log('❌ Login exception:', message);
      throw error;
    }
  },

  signUp: async (email: string, password: string, name: string) => {
    set({ isLoading: true, error: null });

    try {
      console.log('📝 Attempting register with:', { email, name });
      const resp = await authClient.signUp.email({ email, password, name });
      console.log('📝 Register result:', resp);

      if (resp.data?.user) {
        set({
          user: resp.data.user,
          isAuthenticated: true,
          isLoading: false
        });
        console.log('✅ Registration successful');
      } else if (resp.error) {
        set({ error: resp.error.message || 'Registration failed', isLoading: false });
        console.log('❌ Register error:', resp.error);
        throw new Error(resp.error.message || 'Registration failed');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      set({ error: message, isLoading: false });
      console.log('❌ Register exception:', message);
      throw error;
    }
  },

  signOut: async () => {
    set({ isLoading: true, error: null });

    try {
      const result = await authClient.signOut();
      if (!result?.error) {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
        console.log('✅ Logout successful');
      } else {
        set({ error: result.error.message || 'Logout failed', isLoading: false });
        console.log('❌ Logout error:', result.error);
        throw new Error(result.error.message || 'Logout failed');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Logout failed';
      set({ error: message, isLoading: false });
      console.log('❌ Logout exception:', message);
      throw error;
    }
  },

  checkAuth: async () => {
    set({ isLoading: true, error: null });

    try {
      const session = await authClient.getSession();
      if (session.data?.session && session.data?.user) {
        set({
          user: session.data.user,
          isAuthenticated: true,
          isLoading: false
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
      console.warn('Failed to check auth status:', error);
    }
  },

  initializeAuth: async () => {
    // Check for existing session on app start
    await get().checkAuth();
  },

  clearError: () => set({ error: null }),
}));
