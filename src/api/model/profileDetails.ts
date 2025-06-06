/**
 * Generated by orval v7.8.0 🍺
 * Do not edit manually.
 * Bluby API
 * FastAPI backend for the BlubyAI application
 * OpenAPI spec version: 1.0.0
 */
import type { ProfileDetailsBirthDate } from './profileDetailsBirthDate';
import type { ProfileDetailsProfilePicture } from './profileDetailsProfilePicture';

export interface ProfileDetails {
  user_id: number;
  username: string;
  bio: string;
  birth_date?: ProfileDetailsBirthDate;
  profile_picture?: ProfileDetailsProfilePicture;
  private: boolean;
  allow_contact_search: boolean;
}
