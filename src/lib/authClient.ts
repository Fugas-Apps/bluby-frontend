import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAuthClient } from "better-auth/react";
import { cloudflareClient } from "better-auth-cloudflare/client";
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

const betterAuthClient = createAuthClient({
  baseURL: getBaseURL(),
  storage: AsyncStorage, // Use AsyncStorage for React Native
  plugins: [cloudflareClient()], // Add Cloudflare plugin for geolocation and R2 file features
});

// Wrapper to intercept getSession and return dev session when dev mode is active
export const authClient = {
  ...betterAuthClient,
  getSession: async () => {
    // Check if dev mode is active
    if (__DEV__ && Platform.OS === 'web') {
      const devModeState = useDevModeStore.getState();
      if (devModeState.isDevUserEnabled) {
        console.log('🔧 [DEV] Returning mock dev session token');
        return {
          data: {
            session: {
              token: 'dummysession1234',
              userId: 'dev-user-id',
              expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
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

    // Otherwise use the real session
    const session = await betterAuthClient.getSession();
    console.log('📱 Auth Client - Real session:', session.data?.session ? 'Found' : 'Not found');
    return session;
  },
};

// Auth convenience methods for React Native
export const auth = {
  // Session management
  getSession: () => authClient.getSession(),
  signIn: {
    email: (data: { email: string; password: string }) => authClient.signIn.email(data),
    social: (data: { provider: string; callbackURL?: string }) => authClient.signIn.social(data),
  },
  signUp: {
    email: (data: { email: string; password: string; name: string }) =>
      authClient.signUp.email(data),
  },
  signOut: () => authClient.signOut(),

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
    const session = await authClient.getSession();
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
    const session = await authClient.getSession();
    return session.data?.user;
  },
} as const;
