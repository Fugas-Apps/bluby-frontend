import axios from 'axios';
import { API_URL } from '../config';
import { auth } from '../../lib/authWrapper';
import { Platform } from 'react-native';
import { useDevModeStore } from '../../stores/useDevModeStore';

const AXIOS_INSTANCE = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the JWT token from better-auth session
AXIOS_INSTANCE.interceptors.request.use(
  async (config: any) => {
    try {
      // In dev mode on web, use the dummy session token
      if (__DEV__ && Platform.OS === 'web') {
        const devModeState = useDevModeStore.getState();
        if (devModeState.isDevUserEnabled) {
          if (config.headers) {
            config.headers.Authorization = `Bearer dummysession1234`;
          }
          return config;
        }
      }

      // Get the session from the auth wrapper, which handles all cases
      const session = await auth.getSession();
      const token = session.data?.session?.token;

      // Debug logging for session retrieval
      console.log('🔑 [AxiosInterceptor] Session retrieval:', {
        hasSession: !!session.data?.session,
        hasToken: !!token,
        tokenPreview: token ? token.substring(0, 10) + '...' : 'none',
        error: session.error,
      });

      // If the token exists, add it to the Authorization header
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Failed to get auth token from better-auth session:', error);
    }

    return config;
  },
  (error: any) => Promise.reject(error)
);

export const customInstance = <T>(config: any): Promise<T> => {
  return new Promise((resolve, reject) => {
    AXIOS_INSTANCE(config)
      .then((response: any) => resolve(response.data))
      .catch((error: any) => reject(error));
  });
};

// Melody Auth functions (DEPRECATED - Should be removed once fully migrated)
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export interface AuthError {
  message: string;
  code?: string;
}

// Login function
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await AXIOS_INSTANCE.post<AuthResponse>('/auth/login', credentials);
    const { token, user } = response.data;

    // Store the token in AsyncStorage (legacy, keeping for compatibility)
    const { AsyncStorage } = require('@react-native-async-storage/async-storage');
    await AsyncStorage.setItem('melody_auth_token', token);
    await AsyncStorage.setItem('melody_user', JSON.stringify(user));

    return response.data;
  } catch (error: any) {
    throw {
      message: error.response?.data?.message || 'Login failed',
      code: error.response?.data?.code || 'LOGIN_ERROR',
    } as AuthError;
  }
};

// Register function
export const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
  try {
    const response = await AXIOS_INSTANCE.post<AuthResponse>('/auth/register', credentials);
    const { token, user } = response.data;

    // Store the token in AsyncStorage (legacy)
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.setItem('melody_auth_token', token);
    await AsyncStorage.setItem('melody_user', JSON.stringify(user));

    return response.data;
  } catch (error: any) {
    throw {
      message: error.response?.data?.message || 'Registration failed',
      code: error.response?.data?.code || 'REGISTER_ERROR',
    } as AuthError;
  }
};

// Logout function
export const logout = async (): Promise<void> => {
  try {
    // Remove the token from AsyncStorage
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.removeItem('melody_auth_token');
    await AsyncStorage.removeItem('melody_user');

    // Optional: Call the logout endpoint on the server
    try {
      await AXIOS_INSTANCE.post('/auth/logout');
    } catch (error) {
      // Ignore logout endpoint errors
      console.warn('Logout endpoint call failed:', error);
    }
  } catch (error) {
    console.warn('Failed to clear auth data:', error);
  }
};

// Get current user
export const getCurrentUser = async (): Promise<any> => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const userString = await AsyncStorage.getItem('melody_user');
    return userString ? JSON.parse(userString) : null;
  } catch (error) {
    console.warn('Failed to get user from storage:', error);
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const session = await auth.getSession();
    return !!session.data?.session;
  } catch (error) {
    console.warn('Failed to check auth status:', error);
    return false;
  }
};
