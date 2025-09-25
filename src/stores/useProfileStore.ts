import { create } from 'zustand';
import { customInstance } from '../api/mutator/custom-instance';

export interface NutritionGoals {
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
  dailyFiber?: number;
  dailySodium?: number;
}

export interface UserProfile {
  userId: string;
  name?: string;
  email?: string;
  goal: string | null;
  avatarUrl: string | null;
  nutritionGoals: NutritionGoals | null;
  preferences: string[];
  allergies: string[];
  intolerances: string[];
}

interface ProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadProfile: (userId: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateNutritionGoals: (goals: NutritionGoals) => Promise<void>;
  addPreference: (preference: string) => Promise<void>;
  removePreference: (preference: string) => Promise<void>;
  addAllergy: (allergy: string) => Promise<void>;
  removeAllergy: (allergy: string) => Promise<void>;
  addIntolerance: (intolerance: string) => Promise<void>;
  removeIntolerance: (intolerance: string) => Promise<void>;
  clearError: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  isLoading: false,
  error: null,

  loadProfile: async (userId: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await customInstance<UserProfile>({
        url: `/v1/profiles/${userId}`,
        method: 'get',
      });

      set({ profile: response, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load profile';
      set({ error: message, isLoading: false });
      console.error('Profile load failed:', error);
    }
  },

  updateProfile: async (updates: Partial<UserProfile>) => {
    const currentProfile = get().profile;
    if (!currentProfile) throw new Error('No profile loaded');

    set({ isLoading: true, error: null });

    try {
      const response = await customInstance<UserProfile>({
        url: `/v1/profiles/${currentProfile.userId}`,
        method: 'patch',
        data: updates,
      });

      set({
        profile: { ...currentProfile, ...response },
        isLoading: false
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      set({ error: message, isLoading: false });
      console.error('Profile update failed:', error);
      throw error;
    }
  },

  updateNutritionGoals: async (goals: NutritionGoals) => {
    const state = get();
    if (!state.profile) throw new Error('No profile loaded');

    const updatedProfile: Partial<UserProfile> = {
      nutritionGoals: goals,
    };

    await state.updateProfile(updatedProfile);
  },

  addPreference: async (preference: string) => {
    const state = get();
    if (!state.profile) throw new Error('No profile loaded');

    set({ isLoading: true, error: null });

    try {
      await customInstance({
        url: `/v1/profiles/${state.profile.userId}/preferences`,
        method: 'post',
        data: { preference },
      });

      const updatedPreferences = [
        ...(state.profile.preferences || []),
        preference
      ];

      set({
        profile: {
          ...state.profile,
          preferences: updatedPreferences,
        },
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add preference';
      set({ error: message, isLoading: false });
      console.error('Add preference failed:', error);
      throw error;
    }
  },

  removePreference: async (preference: string) => {
    const state = get();
    if (!state.profile) throw new Error('No profile loaded');

    set({ isLoading: true, error: null });

    try {
      await customInstance({
        url: `/v1/profiles/${state.profile.userId}/preferences/${encodeURIComponent(preference)}`,
        method: 'delete',
      });

      const updatedPreferences = (state.profile.preferences || []).filter(
        p => p !== preference
      );

      set({
        profile: {
          ...state.profile,
          preferences: updatedPreferences,
        },
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove preference';
      set({ error: message, isLoading: false });
      console.error('Remove preference failed:', error);
      throw error;
    }
  },

  addAllergy: async (allergy: string) => {
    const state = get();
    if (!state.profile) throw new Error('No profile loaded');

    set({ isLoading: true, error: null });

    try {
      await customInstance({
        url: `/v1/profiles/${state.profile.userId}/allergies`,
        method: 'post',
        data: { allergy },
      });

      const updatedAllergies = [
        ...(state.profile.allergies || []),
        allergy
      ];

      set({
        profile: {
          ...state.profile,
          allergies: updatedAllergies,
        },
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add allergy';
      set({ error: message, isLoading: false });
      console.error('Add allergy failed:', error);
      throw error;
    }
  },

  removeAllergy: async (allergy: string) => {
    const state = get();
    if (!state.profile) throw new Error('No profile loaded');

    set({ isLoading: true, error: null });

    try {
      await customInstance({
        url: `/v1/profiles/${state.profile.userId}/allergies/${encodeURIComponent(allergy)}`,
        method: 'delete',
      });

      const updatedAllergies = (state.profile.allergies || []).filter(
        a => a !== allergy
      );

      set({
        profile: {
          ...state.profile,
          allergies: updatedAllergies,
        },
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove allergy';
      set({ error: message, isLoading: false });
      console.error('Remove allergy failed:', error);
      throw error;
    }
  },

  addIntolerance: async (intolerance: string) => {
    const state = get();
    if (!state.profile) throw new Error('No profile loaded');

    set({ isLoading: true, error: null });

    try {
      await customInstance({
        url: `/v1/profiles/${state.profile.userId}/intolerances`,
        method: 'post',
        data: { intolerance },
      });

      const updatedIntolerances = [
        ...(state.profile.intolerances || []),
        intolerance
      ];

      set({
        profile: {
          ...state.profile,
          intolerances: updatedIntolerances,
        },
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add intolerance';
      set({ error: message, isLoading: false });
      console.error('Add intolerance failed:', error);
      throw error;
    }
  },

  removeIntolerance: async (intolerance: string) => {
    const state = get();
    if (!state.profile) throw new Error('No profile loaded');

    set({ isLoading: true, error: null });

    try {
      await customInstance({
        url: `/v1/profiles/${state.profile.userId}/intolerances/${encodeURIComponent(intolerance)}`,
        method: 'delete',
      });

      const updatedIntolerances = (state.profile.intolerances || []).filter(
        i => i !== intolerance
      );

      set({
        profile: {
          ...state.profile,
          intolerances: updatedIntolerances,
        },
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove intolerance';
      set({ error: message, isLoading: false });
      console.error('Remove intolerance failed:', error);
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
