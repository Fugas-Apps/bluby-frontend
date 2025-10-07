import { create } from 'zustand';
import { Platform } from 'react-native';

interface DevModeState {
  isDevUserEnabled: boolean;
  toggleDevUser: () => void;
}

const IS_DEV = __DEV__;
const IS_WEB = Platform.OS === 'web';

// Only enable dev mode on web in development
const DEV_MODE_AVAILABLE = IS_DEV && IS_WEB;

export const useDevModeStore = create<DevModeState>((set) => ({
  isDevUserEnabled: DEV_MODE_AVAILABLE, // Default to enabled in dev on web
  toggleDevUser: () =>
    set((state) => ({
      isDevUserEnabled: DEV_MODE_AVAILABLE ? !state.isDevUserEnabled : false,
    })),
}));
