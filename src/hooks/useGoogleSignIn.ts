import { useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../stores/useAuthStore';
import { useKVSession } from './useKVSession';

WebBrowser.maybeCompleteAuthSession();

export const useGoogleSignIn = (onSuccess?: (user: any) => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user: storeUser, isAuthenticated } = useAuthStore();
  const { refetch: refetchKVSession } = useKVSession();

  // Get the API URL from environment
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8787';

  // Define the redirect URI that Better Auth will redirect to after OAuth
  // This should be a custom scheme that your app can handle
  const redirectUri = Linking.createURL('/auth/callback');

  console.log("🔧 [GoogleSignIn] App Redirect URI:", redirectUri);
  console.log("🔧 [GoogleSignIn] API URL:", apiUrl);
  console.log("🔧 [GoogleSignIn] Current Zustand user:", storeUser);
  console.log("🔧 [GoogleSignIn] Is Authenticated:", isAuthenticated);

  useEffect(() => {
    // Listen for deep links when the app is already open
    const subscription = Linking.addEventListener('url', handleDeepLink);
    
    // Check if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleDeepLink = async ({ url }: { url: string }) => {
    console.log('📱 [GoogleSignIn] Received deep link:', url);

    // Parse the URL to check if it's an auth callback
    const { hostname, path, queryParams } = Linking.parse(url);
    console.log('🔍 [GoogleSignIn] Parsed URL - hostname:', hostname, 'path:', path, 'queryParams:', queryParams);

    if (path === 'auth/callback') {
      console.log('✅ [GoogleSignIn] Auth callback received');

      // Extract the session token from the URL
      const sessionToken = queryParams?.session_token as string | undefined;

      if (!sessionToken) {
        console.error('❌ [GoogleSignIn] No session token in callback URL');
        console.error('🔍 [GoogleSignIn] Full queryParams:', JSON.stringify(queryParams));
        setIsLoading(false);
        return;
      }

      console.log('🔑 [GoogleSignIn] Session token received:', sessionToken.substring(0, 20) + '...');
      console.log('🔑 [GoogleSignIn] Full session token:', sessionToken);

      // Parse the cookie to extract name and value
      const [cookieName, cookieValue] = sessionToken.split('=');
      console.log('🍪 [GoogleSignIn] Cookie name:', cookieName);
      console.log('🍪 [GoogleSignIn] Cookie value:', cookieValue);

      // Extract just the database token (before the first dot)
      const databaseToken = cookieValue.split('.')[0];
      console.log('🗄️ [GoogleSignIn] Database token:', databaseToken);

      // Store BOTH cookies like regular login does:
      // 1. Store the full cookie with __Secure- prefix (URL decoded)
      // 2. Store the value part with better-auth.session_token key
      const decodedCookieValue = decodeURIComponent(cookieValue);
      console.log('🍪 [GoogleSignIn] Decoded cookie value:', decodedCookieValue);
      
      console.log('💾 [GoogleSignIn] Storing both cookies in AsyncStorage...');
      await AsyncStorage.setItem(cookieName, decodedCookieValue);
      await AsyncStorage.setItem('better-auth.session_token', decodedCookieValue);
      console.log('✅ [GoogleSignIn] Both cookies stored in AsyncStorage');

      // Use KV query instead of authClient
      try {
        console.log('🔐 [GoogleSignIn] Using KV session query to verify session...');
        
        // Refetch the KV session to get user data
        const kvResult = await refetchKVSession();
        
        if (kvResult.data?.user) {
          console.log('👤 [GoogleSignIn] User data from KV:', JSON.stringify(kvResult.data.user, null, 2));
          console.log('🏪 [GoogleSignIn] Zustand store should be updated by useKVSession hook');

          if (onSuccess) {
            console.log('🎉 [GoogleSignIn] Calling onSuccess callback with user');
            onSuccess(kvResult.data.user);
          }
        } else {
          console.error('❌ [GoogleSignIn] No user in KV session:', JSON.stringify(kvResult.data, null, 2));
        }
      } catch (error) {
        console.error('❌ [GoogleSignIn] Error using KV session query:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log('ℹ️ [GoogleSignIn] Deep link received but not auth callback. Path:', path);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      console.log('🚀 [GoogleSignIn] Starting Google sign-in flow...');

      // Request the OAuth URL from Better Auth
      // Better Auth expects a POST request with JSON body
      const signInUrl = `${apiUrl}/api/auth/sign-in/social`;
      const requestBody = {
        provider: 'google',
        callbackURL: redirectUri,
      };

      console.log('🌐 [GoogleSignIn] Requesting OAuth URL from:', signInUrl);
      console.log('📤 [GoogleSignIn] Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(signInUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📡 [GoogleSignIn] OAuth URL response status:', response.status);
      console.log('📡 [GoogleSignIn] OAuth URL response headers:', JSON.stringify(Object.fromEntries(response.headers.entries())));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [GoogleSignIn] Failed to get OAuth URL. Status:', response.status);
        console.error('📄 [GoogleSignIn] Error response body:', errorText);
        throw new Error(`Failed to get OAuth URL: ${response.status} - ${errorText}`);
      }

      const responseText = await response.text();
      console.log('📡 [GoogleSignIn] OAuth URL response body (raw):', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ [GoogleSignIn] Failed to parse OAuth URL response as JSON:', parseError);
        throw new Error('Invalid response from server');
      }

      const authUrl = data.url;
      console.log('🔐 [GoogleSignIn] Opening OAuth URL:', authUrl);

      // Open the browser for OAuth
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        redirectUri
      );

      console.log('🔐 [GoogleSignIn] Browser result type:', result.type);
      console.log('🔐 [GoogleSignIn] Browser result:', JSON.stringify(result, null, 2));

      if (result.type === 'success' && result.url) {
        console.log('✅ [GoogleSignIn] Browser OAuth successful, handling deep link...');
        // Handle the callback URL
        await handleDeepLink({ url: result.url });
      } else if (result.type === 'cancel') {
        console.log('ℹ️ [GoogleSignIn] User cancelled OAuth');
        setIsLoading(false);
      } else {
        console.log('❌ [GoogleSignIn] OAuth failed with result:', JSON.stringify(result, null, 2));
        setIsLoading(false);
      }
    } catch (error) {
      console.error('❌ [GoogleSignIn] Error during Google sign-in:', error);
      console.error('🔍 [GoogleSignIn] Error details:', JSON.stringify(error, null, 2));
      if (error instanceof Error) {
        console.error('🔍 [GoogleSignIn] Error message:', error.message);
        console.error('🔍 [GoogleSignIn] Error stack:', error.stack);
      }
      setIsLoading(false);
      throw error;
    }
  };

  return { signInWithGoogle, isLoading };
};