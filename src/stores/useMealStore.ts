import { create } from 'zustand';
import { customInstance } from '../api/mutator/custom-instance';

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  vitamins?: any;
  minerals?: any;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  potassium?: number;
  calcium?: number;
  iron?: number;
  magnesium?: number;
  zinc?: number;
  selenium?: number;
  vitaminC?: number;
  vitaminD?: number;
  vitaminE?: number;
  vitaminK?: number;
  vitaminA?: number;
  vitaminB1?: number;
  vitaminB2?: number;
  vitaminB3?: number;
  vitaminB6?: number;
  vitaminB12?: number;
  folate?: number;
  processed: string;
  customNutrients?: any;
}

export interface Meal {
  id: string;
  userId: string;
  type: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  createdAt: string;
  foodItems: FoodItem[];
}

interface MealState {
  meals: Meal[];
  currentMeal: Meal | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadMeals: () => Promise<void>;
  createMeal: (type: string, foodItemIds: string[]) => Promise<Meal>;
  loadMeal: (mealId: string) => Promise<Meal>;
  deleteMeal: (mealId: string) => Promise<void>;
  clearError: () => void;
}

export const useMealStore = create<MealState>((set, get) => ({
  meals: [],
  currentMeal: null,
  isLoading: false,
  error: null,

  loadMeals: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await customInstance<Meal[]>({
        url: '/v1/meals',
        method: 'get',
      });

      set({ meals: response, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load meals';
      set({ error: message, isLoading: false });
      console.error('Load meals failed:', error);
      throw error;
    }
  },

  createMeal: async (type: string, foodItemIds: string[]) => {
    set({ isLoading: true, error: null });

    try {
      const response = await customInstance<Meal>({
        url: '/v1/meals',
        method: 'post',
        data: { type, foodItemIds },
      });

      // Add the new meal to the meals list
      const currentMeals = get().meals;
      set({ meals: [response, ...currentMeals], isLoading: false });

      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create meal';
      set({ error: message, isLoading: false });
      console.error('Create meal failed:', error);
      throw error;
    }
  },

  loadMeal: async (mealId: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await customInstance<Meal>({
        url: `/v1/meals/${mealId}`,
        method: 'get',
      });

      set({ currentMeal: response, isLoading: false });
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load meal';
      set({ error: message, isLoading: false });
      console.error('Load meal failed:', error);
      throw error;
    }
  },

  deleteMeal: async (mealId: string) => {
    set({ isLoading: true, error: null });

    try {
      await customInstance({
        url: `/v1/meals/${mealId}`,
        method: 'delete',
      });

      // Remove the meal from the meals list
      const currentMeals = get().meals.filter(meal => meal.id !== mealId);
      set({ meals: currentMeals, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete meal';
      set({ error: message, isLoading: false });
      console.error('Delete meal failed:', error);
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
