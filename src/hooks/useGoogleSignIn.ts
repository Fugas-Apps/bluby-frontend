import { useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { authClient } from '../lib/authClient';

WebBrowser.maybeCompleteAuthSession();

export const useGoogleSignIn = (onSuccess?: (user: any) => void) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Get the API URL from environment
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8787';
  
  // Define the redirect URI that Better Auth will redirect to after OAuth
  // This should be a custom scheme that your app can handle
  const redirectUri = Linking.createURL('/auth/callback');
  
  console.log("App Redirect URI:", redirectUri);
  console.log("API URL:", apiUrl);

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
    console.log('📱 Received deep link:', url);

    // Parse the URL to check if it's an auth callback
    const { hostname, path, queryParams } = Linking.parse(url);

    if (path === 'auth/callback') {
      console.log('✅ Auth callback received');

      // Extract the session token from the URL
      const sessionToken = queryParams?.session_token as string | undefined;

      if (!sessionToken) {
        console.error('❌ No session token in callback URL');
        setIsLoading(false);
        return;
      }

      console.log('🔑 Session token received:', sessionToken.substring(0, 20) + '...');

      // Verify the session with our backend using the token
      try {
        const response = await fetch(`${apiUrl}/api/auth/get-session`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': `better-auth.session_token=${sessionToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Session verified:', data);

          if (data?.user && onSuccess) {
            onSuccess(data.user);
          } else {
            console.error('❌ No user in session data:', data);
          }
        } else {
          console.error('❌ Session verification failed:', response.status);
        }
      } catch (error) {
        console.error('❌ Error verifying session:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);

      // Request the OAuth URL from Better Auth
      // Better Auth expects a POST request with JSON body
      const response = await fetch(`${apiUrl}/api/auth/sign-in/social`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'google',
          callbackURL: redirectUri,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get OAuth URL: ${response.status}`);
      }

      const data = await response.json();
      const authUrl = data.url;

      console.log('🔐 Opening OAuth URL:', authUrl);

      // Open the browser for OAuth
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        redirectUri
      );

      console.log('🔐 Browser result:', result);

      if (result.type === 'success' && result.url) {
        // Handle the callback URL
        await handleDeepLink({ url: result.url });
      } else if (result.type === 'cancel') {
        console.log('ℹ️ User cancelled OAuth');
        setIsLoading(false);
      } else {
        console.log('❌ OAuth failed:', result);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('❌ Error during Google sign-in:', error);
      setIsLoading(false);
      throw error;
    }
  };

  return { signInWithGoogle, isLoading };
};