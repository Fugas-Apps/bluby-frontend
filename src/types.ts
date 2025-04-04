export type RootStackParamList = {
  Main: undefined;
  MealDetail: { mealType: string };
  MealEvaluation: { mealType: string };
  Scanner: undefined;
};

export type BottomTabParamList = {
  Dashboard: undefined;
  Pantry: undefined;
  MealPlan: undefined;
  Groups: undefined;
  Profile: undefined;
};

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';

export type FoodItem = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  processed: 'low' | 'medium' | 'high';
};

export type Meal = {
  type: MealType;
  items: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
};

export type PantryItem = {
  id: string;
  name: string;
  quantity: number;
  isScanned: boolean;
  barcode?: string;
};

export type Recipe = {
  id: string;
  name: string;
  ingredients: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  type: 'AI' | 'DB' | 'Basic';
};

export type GroupMember = {
  id: string;
  name: string;
  avatarUrl?: string;
};

export type Group = {
  id: string;
  name: string;
  members: GroupMember[];
};

export type UserProfile = {
  name: string;
  allergies: string[];
  dietaryPreferences: string[];
  intolerances: string[];
  goal: 'weight-loss' | 'muscle-gain' | 'maintenance' | 'health';
}; 