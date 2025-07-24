declare module 'itty-router-extras';

// API Types
export interface ProfileDetailsBirthDate {
  year: number;
  month: number;
  day: number;
}

export interface ProfileDetailsProfilePicture {
  url: string;
  thumbnail_url?: string;
}

export interface ProfileDetails {
  user_id: number;
  username: string;
  bio: string;
  birth_date?: ProfileDetailsBirthDate;
  profile_picture?: ProfileDetailsProfilePicture;
  private: boolean;
  allow_contact_search: boolean;
}

export interface ProfileUpdateBio {
  value: string;
}

export interface ProfileUpdateBirthDate {
  year: number;
  month: number;
  day: number;
}

export interface ProfileUpdatePhoneNumber {
  value: string;
}

export interface ProfileUpdate {
  bio?: ProfileUpdateBio;
  birth_date?: ProfileUpdateBirthDate;
  private_birth_date?: boolean;
  phone_number?: ProfileUpdatePhoneNumber;
  private?: boolean;
  allow_contact_search?: boolean;
}

export interface SuccessResponseProfileDetails {
  status?: string;
  body: ProfileDetails;
}

export interface HTTPValidationError {
  detail: ValidationError[];
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

// Database Types (from schema.sql)
export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  processed: 'low' | 'medium' | 'high';
}

export interface Meal {
  id: string;
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  createdAt: string;
  items: FoodItem[];
}

export interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  isScanned: boolean;
  barcode?: string;
  userId: string;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  type: 'AI' | 'DB' | 'Basic';
}

export interface Group {
  id: string;
  name: string;
  members: GroupMember[];
}

export interface GroupMember {
  userId: string;
  name: string;
  avatarUrl?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  allergies: string[];
  dietaryPreferences: string[];
  intolerances: string[];
  goal: 'weight-loss' | 'muscle-gain' | 'maintenance' | 'health';
  avatarUrl?: string;
}
