import { useEffect } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { authClient } from '../lib/authClient';

// Hook to sync session from Better Auth
export const useSessionSync = () => {
  const { user, isAuthenticated } = useAuthStore();

  // Use the standard auth client hook to get the session
  const {
    data: sessionData,
    isPending: isLoading,
    error
  } = authClient.useSession();

  // Update Zustand store when we get session data
  useEffect(() => {
    if (sessionData?.user && !isAuthenticated) {
      console.log('🏪 [SessionSync] Updating Zustand store with user data...');
      console.log('👤 [SessionSync] User data:', JSON.stringify(sessionData.user, null, 2));

      useAuthStore.setState({
        user: sessionData.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        loginType: 'google',
      });

      console.log('✅ [SessionSync] Zustand store updated from session data');
    } else if (!sessionData && !isLoading && isAuthenticated) {
      // Optional: Handle logout if session is invalid but store thinks we are authenticated
      // But be careful not to cause loops or premature logouts during initial load
      // For now, we trust the store if it's set, but maybe we should verify?
    }
  }, [sessionData, isAuthenticated, isLoading]);

  return {
    sessionData,
    isLoading,
    error,
  };
};