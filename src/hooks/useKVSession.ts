import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/useAuthStore';
import { authWrapper } from '../lib/authWrapper';

// Interface for the session data structure from KV
interface KVSessionData {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
    emailVerified?: boolean;
  };
  session: {
    token: string;
    expiresAt: number;
    userId: string;
  };
}

// Function to fetch session data directly from KV
const fetchSessionFromKV = async (): Promise<KVSessionData | null> => {
  try {
    console.log('🔍 [KVSession] Starting KV session fetch...');

    // Get the session token from auth wrapper
    const session = await authWrapper.getSession();
    const sessionToken = session.data?.session?.token;

    if (!sessionToken) {
      console.log('❌ [KVSession] No session token found in AsyncStorage');
      return null;
    }

    console.log('🔑 [KVSession] Found session token:', sessionToken.substring(0, 20) + '...');

    // Extract just the database token (before the first dot)
    const databaseToken = sessionToken.split('.')[0];
    console.log('🗄️ [KVSession] Database token for KV lookup:', databaseToken);

    // Call our backend API to query KV directly
    const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8787';
    const kvUrl = `${apiUrl}/api/auth/kv-session/${databaseToken}`;

    console.log('🌐 [KVSession] Fetching from KV endpoint:', kvUrl);

    const response = await fetch(kvUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // TODO: This sometimes shouldn't thrown an error, like when logging out. Beware of pricing spikes for no reason.
      console.error('❌ [KVSession] KV fetch failed. Status:', response.status);
      const errorText = await response.text();
      console.error('📄 [KVSession] Error response:', errorText);
      return null;
    }

    const sessionData = await response.json();
    console.log('✅ [KVSession] KV session data received:', JSON.stringify(sessionData, null, 2));

    return sessionData;
  } catch (error) {
    console.error('❌ [KVSession] Error fetching from KV:', error);
    return null;
  }
};

// Hook to query session from KV
export const useKVSession = () => {
  const { user, isAuthenticated } = useAuthStore();

  const {
    data: sessionData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['kv-session'],
    queryFn: fetchSessionFromKV,
    enabled: !isAuthenticated, // Only run if not already authenticated
    retry: 3,
    retryDelay: 1000,
  });

  // Update Zustand store when we get session data
  useEffect(() => {
    if (sessionData?.user && !isAuthenticated) {
      console.log('🏪 [KVSession] Updating Zustand store with KV user data...');
      console.log('👤 [KVSession] User data:', JSON.stringify(sessionData.user, null, 2));

      // Also store the session token using auth wrapper
      if (sessionData.session?.token) {
        console.log('💾 [KVSession] Storing session token via auth wrapper...');
        authWrapper.storeGoogleSessionToken(sessionData.session.token);
      }

      useAuthStore.setState({
        user: sessionData.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        loginType: 'google', // KV session is only used for Google OAuth
      });

      console.log('✅ [KVSession] Zustand store updated from KV data with loginType: google');
    }
  }, [sessionData, isAuthenticated]);

  return {
    sessionData,
    isLoading,
    error,
    refetch,
  };
};
