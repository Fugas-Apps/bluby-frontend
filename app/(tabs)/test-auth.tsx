import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { usePostAuthLogin, usePostAuthRegister, usePostAuthLogout } from '../../src/api/default/default';
import { login, register, logout, isAuthenticated, getCurrentUser } from '../../src/api/mutator/custom-instance';

export default function TestAuthScreen() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('Test User');
  const [user, setUser] = useState<any>(null);
  const [authStatus, setAuthStatus] = useState(false);

  // Use the generated API hooks
  const loginMutation = usePostAuthLogin();
  const registerMutation = usePostAuthRegister();
  const logoutMutation = usePostAuthLogout();

  const handleLogin = async () => {
    try {
      // Using custom instance for now since the generated hooks don't have proper types
      const response = await login({ email, password });
      setUser(response.user);
      setAuthStatus(true);
      Alert.alert('Success', 'Logged in successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Login failed');
    }
  };

  const handleRegister = async () => {
    try {
      // Using custom instance for now since the generated hooks don't have proper types
      const response = await register({ email, password, name });
      setUser(response.user);
      setAuthStatus(true);
      Alert.alert('Success', 'Registered successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Registration failed');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setAuthStatus(false);
      Alert.alert('Success', 'Logged out successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Logout failed');
    }
  };

  const checkAuthStatus = async () => {
    const status = await isAuthenticated();
    const currentUser = await getCurrentUser();
    setAuthStatus(status);
    setUser(currentUser);
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending || logoutMutation.isPending;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Melody Auth Test</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.status}>Authenticated: {authStatus ? 'Yes' : 'No'}</Text>
        {user && (
          <Text style={styles.user}>User: {user.name} ({user.email})</Text>
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
