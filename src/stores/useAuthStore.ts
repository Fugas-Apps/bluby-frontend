import { create } from 'zustand';
import { authClient } from '../lib/authClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { manualSignOut } from '../utils/manualSignOut';

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
  loginType: 'email' | 'google' | null; // Track how the user logged in

  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null, loginType: 'email' | 'google') => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  loginType: null,

  setUser: (user: User | null, loginType: 'email' | 'google') => {
    set({
      user,
      isAuthenticated: !!user,
      loginType: user ? loginType : null,
    });
  },

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
          isLoading: false,
          loginType: 'email'
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
          isLoading: false,
          loginType: 'email'
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
      const currentLoginType = get().loginType;
      console.log('🔐 [AuthStore] Signing out. Login type:', currentLoginType);

      // Use manual sign-out for Google users, Better Auth for email users
      if (currentLoginType === 'google') {
        console.log('🔐 [AuthStore] Using manual sign-out for Google user');
        const result = await manualSignOut();

        if (result.success) {
          console.log('✅ [AuthStore] Manual sign-out successful');
          // manualSignOut already updates the state, but ensure loading is false
          set({ isLoading: false });
        } else {
          set({ error: result.error || 'Logout failed', isLoading: false });
          console.log('❌ [AuthStore] Manual sign-out error:', result.error);
          throw new Error(result.error || 'Logout failed');
        }
      } else {
        console.log('🔐 [AuthStore] Using Better Auth sign-out for email user');
        const result = await authClient.signOut();

        if (!result?.error) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            loginType: null
          });
          console.log('✅ [AuthStore] Better Auth logout successful');
        } else {
          set({ error: result.error.message || 'Logout failed', isLoading: false });
          console.log('❌ [AuthStore] Logout error:', result.error);
          throw new Error(result.error.message || 'Logout failed');
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Logout failed';
      set({ error: message, isLoading: false });
      console.log('❌ [AuthStore] Logout exception:', message);
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
