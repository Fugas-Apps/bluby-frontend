import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

const AXIOS_INSTANCE = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the JWT token from AsyncStorage
AXIOS_INSTANCE.interceptors.request.use(
  async (config: any) => {
    try {
      // Get the JWT token from AsyncStorage
      const token = await AsyncStorage.getItem('melody_auth_token');
      
      // If the token exists, add it to the Authorization header
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Failed to get auth token from storage:', error);
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

// Melody Auth functions
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
    
    // Store the token in AsyncStorage
    await AsyncStorage.setItem('melody_auth_token', token);
    await AsyncStorage.setItem('melody_user', JSON.stringify(user));
    
    return response.data;
  } catch (error: any) {
    throw {
      message: error.response?.data?.message || 'Login failed',
      code: error.response?.data?.code || 'LOGIN_ERROR'
    } as AuthError;
  }
};

// Register function
export const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
  try {
    const response = await AXIOS_INSTANCE.post<AuthResponse>('/auth/register', credentials);
    const { token, user } = response.data;
    
    // Store the token in AsyncStorage
    await AsyncStorage.setItem('melody_auth_token', token);
    await AsyncStorage.setItem('melody_user', JSON.stringify(user));
    
    return response.data;
  } catch (error: any) {
    throw {
      message: error.response?.data?.message || 'Registration failed',
      code: error.response?.data?.code || 'REGISTER_ERROR'
    } as AuthError;
  }
};

// Logout function
export const logout = async (): Promise<void> => {
  try {
    // Remove the token from AsyncStorage
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
    const token = await AsyncStorage.getItem('melody_auth_token');
    return !!token;
  } catch (error) {
    console.warn('Failed to check auth status:', error);
    return false;
  }
};
