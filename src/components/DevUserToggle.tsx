import React, { useEffect } from 'react';
import { View, Text, Switch, StyleSheet, Platform } from 'react-native';
import { useDevModeStore } from '../stores/useDevModeStore';
import { useAuthStore } from '../stores/useAuthStore';

const IS_DEV = __DEV__;
const IS_WEB = Platform.OS === 'web';

export const DevUserToggle: React.FC = () => {
  const { isDevUserEnabled, toggleDevUser } = useDevModeStore();
  const authStore = useAuthStore();

  // Listen to dev mode changes and update auth state accordingly
  useEffect(() => {
    if (isDevUserEnabled) {
      // Enable dev user
      authStore.setUser(
        {
          id: 'dev-user-id',
          email: 'testuser@blubyai.com',
          name: 'Test User',
        },
        'email'
      );
      console.log('🔧 [DEV] Enabled dev user mode');
    } else {
      // Disable dev user (log out)
      authStore.setUser(null, 'email');
      console.log('🔧 [DEV] Disabled dev user mode');
    }
  }, [isDevUserEnabled]);

  // Only render on web in development
  if (!IS_DEV || !IS_WEB) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.label}>Dev User Mode</Text>
          <Text style={styles.sublabel}>testuser@blubyai.com</Text>
        </View>
        <Switch
          value={isDevUserEnabled}
          onValueChange={toggleDevUser}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isDevUserEnabled ? '#007AFF' : '#f4f3f4'}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 9999,
    borderWidth: 2,
    borderColor: '#ff6b6b',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  textContainer: {
    flexDirection: 'column',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  sublabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
});
