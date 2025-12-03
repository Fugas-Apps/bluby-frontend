import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAuthClient } from 'better-auth/react';
import { cloudflareClient } from 'better-auth-cloudflare/client';
import { Platform } from 'react-native';
import { useDevModeStore } from '../stores/useDevModeStore';

// Use environment variable or fallback
const getBaseURL = () => {
  if (__DEV__) {
    // For React Native development, use environment variable or localhost
    const baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8787';
    console.log('📱 Auth Client - Using development baseURL:', baseURL);
    return baseURL;
  }
  const baseURL = process.env.EXPO_PUBLIC_API_URL || 'https://api.blubyai.com';
  console.log('📱 Auth Client - Using production baseURL:', baseURL);
  return baseURL;
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  storage: AsyncStorage, // Use AsyncStorage for React Native
  plugins: [cloudflareClient()], // Add Cloudflare plugin for geolocation and R2 file features
});

// Custom session storage keys for Google OAuth fallback
const GOOGLE_SESSION_TOKEN_KEY = 'google_oauth_session_token';
const BETTER_AUTH_SESSION_KEY = 'better-auth.session_token';

// Custom auth wrapper that handles all session scenarios
class AuthWrapper {
  private static instance: AuthWrapper;

  static getInstance(): AuthWrapper {
    if (!AuthWrapper.instance) {
      AuthWrapper.instance = new AuthWrapper();
    }
    return AuthWrapper.instance;
  }

  // Get session with fallback logic
  async getSession(): Promise<any> {
    try {
      // Check if dev mode is active
      if (__DEV__ && Platform.OS === 'web') {
        const devModeState = useDevModeStore.getState();
        if (devModeState.isDevUserEnabled) {
          console.log('🔧 [AuthWrapper] Returning mock dev session token');
          return {
            data: {
              session: {
                token: 'dummysession1234',
                userId: 'dev-user-id',
                expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
              },
              user: {
                id: 'dev-user-id',
                email: 'testuser@blubyai.com',
                name: 'Test User',
              },
            },
            error: null,
          };
        }
      }

      // Try Better Auth session first
      console.log('🔍 [AuthWrapper] Trying Better Auth session...');
      const session = await authClient.getSession();

      if (session.data?.session?.token) {
        console.log('✅ [AuthWrapper] Better Auth session found');
        return session;
      }

      // Fallback to Google OAuth session token
      console.log(
        '🔍 [AuthWrapper] Better Auth session not found, trying Google OAuth fallback...'
      );
      const googleToken = await AsyncStorage.getItem(GOOGLE_SESSION_TOKEN_KEY);

      if (googleToken) {
        console.log('✅ [AuthWrapper] Google OAuth session token found in fallback');
        return {
          data: {
            session: {
              token: googleToken,
              userId: 'unknown', // We'll need to fetch this from KV if needed
              expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
            },
            user: null, // User data should be in Zustand store
          },
          error: null,
        };
      }

      console.log('❌ [AuthWrapper] No session found in any storage');
      return { data: undefined, error: null };
    } catch (error) {
      console.error('❌ [AuthWrapper] Error getting session:', error);
      return { data: undefined, error };
    }
  }

  // Store Google OAuth session token
  async storeGoogleSessionToken(token: string): Promise<void> {
    try {
      console.log('💾 [AuthWrapper] Storing Google OAuth session token...');
      await AsyncStorage.setItem(GOOGLE_SESSION_TOKEN_KEY, token);
      await AsyncStorage.setItem(BETTER_AUTH_SESSION_KEY, token); // Also try Better Auth key
      console.log('✅ [AuthWrapper] Google OAuth session token stored');
    } catch (error) {
      console.error('❌ [AuthWrapper] Failed to store Google session token:', error);
    }
  }

  // Clear all session data
  async clearSession(): Promise<void> {
    try {
      console.log('🗑️ [AuthWrapper] Clearing all session data...');
      await AsyncStorage.multiRemove([
        GOOGLE_SESSION_TOKEN_KEY,
        BETTER_AUTH_SESSION_KEY,
        '__Secure-better-auth.session_token',
      ]);
      console.log('✅ [AuthWrapper] All session data cleared');
    } catch (error) {
      console.error('❌ [AuthWrapper] Failed to clear session data:', error);
    }
  }

  // Get current user data (combines session with Zustand store)
  async getCurrentUser(): Promise<any> {
    const session = await this.getSession();
    return session.data?.user || null;
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession();
    return !!session.data?.session?.token;
  }
}

// Export singleton instance
const authWrapperInstance = AuthWrapper.getInstance();

// Create a separate wrapper for getSession that handles dev mode (for backward compatibility)
export const getSessionWithDevMode = async () => {
  return await authWrapperInstance.getSession();
};

// Auth convenience methods for React Native (updated to use wrapper)
export const auth = {
  // Session management
  getSession: () => getSessionWithDevMode(),
  signIn: {
    email: (data: { email: string; password: string }) => authClient.signIn.email(data),
    social: (data: { provider: string; callbackURL?: string }) => authClient.signIn.social(data),
  },
  signUp: {
    email: (data: { email: string; password: string; name: string }) =>
      authClient.signUp.email(data),
  },
  signOut: async () => {
    try {
      // Clear our custom session data first
      await authWrapperInstance.clearSession();
      // Then call Better Auth sign out
      return await authClient.signOut();
    } catch (error) {
      console.error('❌ [AuthWrapper] Error during sign out:', error);
      // Still try to clear local data even if server call fails
      await authWrapperInstance.clearSession();
      return { error: error instanceof Error ? error.message : 'Sign out failed' };
    }
  },

  // File operations (if R2 is configured on server)
  uploadFile: async (file: File, metadata?: any) => {
    // This would normally be handled by the server-side R2 integration
    // For now, we'll just upload to the API endpoint
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    // Get session to access token
    const session = await getSessionWithDevMode();
    const token = session.data?.session?.token;

    const response = await fetch(`${getBaseURL()}/files/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    return response.json();
  },

  // Get current user data
  getUser: async () => {
    const session = await getSessionWithDevMode();
    return session.data?.user;
  },
} as const;

// Export wrapper instance for direct access in hooks
export { authWrapperInstance as authWrapper };
