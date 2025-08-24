import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ActivityIndicator } from 'react-native';

import { authClient, auth } from 'src/lib/authClient';

export default function TestAuthScreen() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('Test User');
  type User = { id: string; email: string; name?: string | null; image?: string | null } | null;
  const [user, setUser] = useState<User>(null);
  const [authStatus, setAuthStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Call the useSession hook at the top level of the component (Rules of Hooks)
  // This returns the reactive session object from the auth client.
  // Assumption: authClient.useSession exists in this runtime (created by createAuthClient).
  const session = authClient.useSession?.();

  // Type guard to detect a subscribe-able session object without using `any`
  const hasSubscribe = (s: unknown): s is { subscribe: (cb: () => void) => (() => void) | void } => {
    return !!s && typeof (s as { subscribe?: unknown }).subscribe === 'function';
  };

  // Check auth status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Keep local state in sync when the session object changes
  useEffect(() => {
    // If session exposes a subscribe method (original code used this), use it to react to changes.
    if (hasSubscribe(session)) {
      const unsub = session.subscribe(() => {
        try {
          if (session?.data?.session && session?.data?.user) {
            setAuthStatus(true);
            setUser(session.data.user);
          } else {
            setAuthStatus(false);
            setUser(null);
          }
        } catch (e) {
          // ignore
        }
      });
      return () => unsub && unsub();
    }

    // Fallback: if no subscribe, sync once when session reference changes
    try {
      if (session?.data?.session && session?.data?.user) {
        setAuthStatus(true);
        setUser(session.data.user);
      } else {
        setAuthStatus(false);
        setUser(null);
      }
    } catch (e) {
      // ignore
    }
  }, [session]);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      console.log('🔐 Attempting login with:', { email });
      const resp = await authClient.signIn.email({ email, password });
      console.log('🔐 Login result:', resp);
      if (resp.data?.user) {
        setUser(resp.data.user);
        setAuthStatus(true);
        Alert.alert('Success', 'Logged in successfully!');
      } else if (resp.error) {
        console.log('❌ Login error:', resp.error);
        Alert.alert('Error', resp.error.message || 'Login failed');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.log('❌ Login exception:', message);
      Alert.alert('Error', message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      console.log('📝 Attempting register with:', { email, name });
      const resp = await authClient.signUp.email({ email, password, name });
      console.log('📝 Register result:', resp);
      if (resp.data?.user) {
        setUser(resp.data.user);
        setAuthStatus(true);
        Alert.alert('Success', 'Registered successfully!');
      } else if (resp.error) {
        console.log('❌ Register error:', resp.error);
        Alert.alert('Error', resp.error.message || 'Registration failed');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.log('❌ Register exception:', message);
      Alert.alert('Error', message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const result = await authClient.signOut();
      if (!result?.error) {
        setUser(null);
        setAuthStatus(false);
        Alert.alert('Success', 'Logged out successfully!');
      } else {
        Alert.alert('Error', result.error?.message || 'Logout failed');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      Alert.alert('Error', message || 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuthStatus = async () => {
    try {
  const session = await authClient.getSession();
      if (session.data?.session && session.data?.user) {
        setAuthStatus(true);
        setUser(session.data.user);
      } else {
        setAuthStatus(false);
        setUser(null);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn('Failed to check auth status:', message);
      setAuthStatus(false);
      setUser(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bluby Auth Test</Text>

      <View style={styles.statusContainer}>
        <Text style={styles.status}>Authenticated: {authStatus ? 'Yes' : 'No'}</Text>
        {user && (
          <Text style={styles.user}>
            User: {user.name} ({user.email})
          </Text>
        )}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Name (for registration)"
        value={name}
        onChangeText={setName}
      />

      <View style={styles.buttonContainer}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <>
            <Button title="Login" onPress={handleLogin} />
            <Button title="Register" onPress={handleRegister} />
            <Button title="Logout" onPress={handleLogout} />
            <Button title="Check Auth Status" onPress={checkAuthStatus} />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  statusContainer: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  status: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  user: {
    fontSize: 14,
    color: '#666',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 20,
  },
});
