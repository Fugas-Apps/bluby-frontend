import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from 'src/contexts/AuthProvider';

export default function TestAuthScreen() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('Test User');

  // Use the new auth hook
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    checkAuth,
    clearError,
    signInWithGoogle,
  } = useAuth();

  const handleLogin = async () => {
    try {
      await signIn(email, password);
      Alert.alert('Success', 'Logged in successfully!');
    } catch (error) {
      // Error already handled by the auth store and displayed in UI
      Alert.alert('Error', 'Login failed');
    }
  };

  const handleRegister = async () => {
    try {
      await signUp(email, password, name);
      Alert.alert('Success', 'Registered successfully!');
    } catch (error) {
      // Error already handled by the auth store and displayed in UI
      Alert.alert('Error', 'Registration failed');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      Alert.alert('Success', 'Logged out successfully!');
    } catch (error) {
      // Error already handled by the auth store and displayed in UI
      Alert.alert('Error', 'Logout failed');
    }
  };

  const handleCheckAuth = async () => {
    try {
      await checkAuth();
    } catch (error) {
      console.warn('Auth check failed:', error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      Alert.alert('Success', 'Google login completed!');
    } catch (error) {
      // Error already handled by the auth store and displayed in UI
      Alert.alert('Error', 'Google login failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bluby Auth Test (with Zustand)</Text>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.error}>Error: {error}</Text>
        </View>
      )}

      <View style={styles.statusContainer}>
        <Text style={styles.status}>API_URL: {process.env.EXPO_PUBLIC_API_URL}</Text>
        <Text style={styles.status}>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</Text>
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
            <Button title="Login with Google" onPress={handleGoogleLogin} />
            <Button title="Logout" onPress={handleLogout} />
            <Button title="Check Auth Status" onPress={handleCheckAuth} />
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
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 4,
    marginBottom: 15,
  },
  error: {
    color: '#d32f2f',
    fontSize: 14,
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
