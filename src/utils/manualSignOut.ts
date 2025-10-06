import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../stores/useAuthStore';

/**
 * Manual sign out for Google OAuth users
 * This is needed because Better Auth's signOut doesn't work well with Google OAuth on Cloudflare Workers
 *
 * What this does:
 * 1. Gets the session token from AsyncStorage
 * 2. Calls our custom /api/delete-session endpoint to remove session from database
 * 3. Clears AsyncStorage
 * 4. Updates Zustand store
 */
export const manualSignOut = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🔐 [ManualSignOut] Starting manual sign out for Google user...');

    // Step 1: Get the session token from AsyncStorage
    const sessionToken = await AsyncStorage.getItem('better-auth.session_token');
    console.log('🔑 [ManualSignOut] Found session token:', sessionToken ? 'Yes' : 'No');

    if (!sessionToken) {
      console.log('ℹ️ [ManualSignOut] No session token found, clearing local state only');
      useAuthStore.setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      return { success: true };
    }

    // Step 2: Delete the session from the database via custom endpoint
    const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8787';
    const deleteSessionUrl = `${apiUrl}/api/delete-session`;

    console.log('🌐 [ManualSignOut] Deleting session from database:', deleteSessionUrl);

    const response = await fetch(deleteSessionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionToken }),
    });

    if (!response.ok) {
      console.error('❌ [ManualSignOut] Failed to delete session from database. Status:', response.status);
      const errorText = await response.text();
      console.error('📄 [ManualSignOut] Error response:', errorText);
      // Continue with local cleanup even if server call fails
    } else {
      const result = await response.json();
      console.log('✅ [ManualSignOut] Session deleted from database:', result);
    }

    // Step 3: Clear all session data from AsyncStorage
    console.log('🗑️ [ManualSignOut] Clearing session data from AsyncStorage...');
    await AsyncStorage.multiRemove([
      'better-auth.session_token',
      '__Secure-better-auth.session_token',
      'bluby_cookie',
    ]);

    // Step 4: Clear local auth state
    console.log('🏪 [ManualSignOut] Clearing Zustand store...');
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });

    console.log('✅ [ManualSignOut] Manual sign out completed successfully');
    return { success: true };

  } catch (error) {
    console.error('❌ [ManualSignOut] Error during manual sign out:', error);

    // Even if there's an error, try to clear local state
    try {
      await AsyncStorage.multiRemove([
        'better-auth.session_token',
        '__Secure-better-auth.session_token',
        'bluby_cookie',
      ]);

      useAuthStore.setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

      console.log('🔧 [ManualSignOut] Local state cleared despite error');
      return { success: true };
    } catch (cleanupError) {
      console.error('❌ [ManualSignOut] Failed to clear local state:', cleanupError);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during sign out'
      };
    }
  }
};
