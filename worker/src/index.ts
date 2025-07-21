import { Router } from 'itty-router';
import { error, json, withParams } from 'itty-router-extras';
import { D1Database, R2Bucket } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
  bluby_food_images: R2Bucket;
  bluby_user_avatars: R2Bucket;
}

// Types matching our database schema
interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  processed: 'low' | 'medium' | 'high';
}

interface Meal {
  id: string;
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  createdAt: string;
  items: FoodItem[];
}

interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  isScanned: boolean;
  barcode?: string;
  userId: string;
}

interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  type: 'AI' | 'DB' | 'Basic';
}

interface Group {
  id: string;
  name: string;
  members: GroupMember[];
}

interface GroupMember {
  userId: string;
  name: string;
  avatarUrl?: string;
}

interface UserProfile {
  id: string;
  name: string;
  allergies: string[];
  dietaryPreferences: string[];
  intolerances: string[];
  goal: 'weight-loss' | 'muscle-gain' | 'maintenance' | 'health';
  avatarUrl?: string;
}

const router = Router();

// Authentication middleware
router.all('*', async (request, env: Env) => {
  // TODO: Implement JWT verification
  return;
});

// Root endpoint
router.get('/', () => {
  return new Response(JSON.stringify({
    name: 'Bluby API',
    version: '1.0',
    endpoints: {
      health: '/health',
      docs: 'Coming soon'
    }
  }), {
    headers: {
      'Content-Type': 'application/json'
    }
  });
});

// Health check endpoint
router.get('/health', () => json({ status: 'ok' }));

// Hello world endpoint
router.get('/hello', () => json({ 
  message: 'Hello from Bluby API! 🥗',
  timestamp: new Date().toISOString(),
  puta: "mierda"
}));

// API routes will be added here

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: any
  ): Promise<Response> {
    return router
      .handle(request, env, ctx)
      .catch(error);
  },
};
