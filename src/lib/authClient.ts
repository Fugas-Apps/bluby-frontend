import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAuthClient } from "better-auth/react";
import { cloudflareClient } from "better-auth-cloudflare/client";

// Use localhost for React Native development
const getBaseURL = () => {
  if (__DEV__) {
    // For React Native development, use localhost
    const baseURL = 'http://localhost:8787';
    console.log('📱 Auth Client - Using development baseURL:', baseURL);
    return baseURL;
  }
  const baseURL = process.env.API_URL || 'https://api.blubyai.com';
  console.log('📱 Auth Client - Using production baseURL:', baseURL);
  return baseURL;
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  storage: AsyncStorage, // Use AsyncStorage for React Native
  plugins: [cloudflareClient()], // Add Cloudflare plugin for geolocation and R2 file features
});

// Auth convenience methods for React Native
export const auth = {
  // Session management
  getSession: () => authClient.getSession(),
  signIn: {
    email: (data: { email: string; password: string }) => authClient.signIn.email(data),
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
