import { useEffect } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { authClient } from '../lib/authClient';

WebBrowser.maybeCompleteAuthSession();

export const useGoogleSignIn = (onSuccess?: (user: any) => void) => {
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'bluby',
  });
  console.log("URI:", redirectUri)
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || "739625151203-6gnt5rcuuv2gdph2k4ahtoh5n1t6is16.apps.googleusercontent.com",
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || "739625151203-98po48qkgtnavp1c0h7v6skljvpnrsm8.apps.googleusercontent.com",
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || "739625151203-fjp16p6ienal3bb1q8bva9oqdavvsbmn.apps.googleusercontent.com",
    redirectUri,
    scopes: ['openid', 'profile', 'email'],
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        // Send to backend
        fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/callback/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: authentication.accessToken }),
        })
          .then((res) => res.ok ? res.json() : Promise.reject(res))
          .then((data) => {
            console.log('Google sign-in callback:', data);
            if (data.user && onSuccess) {
              onSuccess(data.user);
            }
          })
          .catch((error) => {
            console.error('Google sign-in error:', error);
          });
      }
    }
  }, [response, onSuccess]);

  const signInWithGoogle = async () => {
    await promptAsync();
  };

  return { signInWithGoogle, request };
};