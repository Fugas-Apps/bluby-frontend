import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // The session handling is done in useGoogleSignIn hook
    // Redirect to test-auth page to verify authentication
    const timer = setTimeout(() => {
      console.log('🔀 Redirecting to test-auth page');
      router.replace('/(tabs)/test-auth');
    }, 1000); // Increased delay to ensure state updates complete

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 16 }}>Completing sign in...</Text>
    </View>
  );
}
