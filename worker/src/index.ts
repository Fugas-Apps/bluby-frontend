import { Router } from 'itty-router';
import { error, json, withParams } from 'itty-router-extras';
import { D1Database, R2Bucket } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
  bluby_food_images: R2Bucket;
  bluby_user_avatars: R2Bucket;
  AI: any; // Workers AI binding
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
even if thaeven if that's "structured output" from the APIt's "structured output" from the API
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

// Food scanning service class
class FoodScanService {
  constructor() {
    // Initialize with any necessary configuration
  }

  // Validate if the provided string is a valid base64 encoded image
  isValidBase64Image(imageData: string): boolean {
    try {
      // Try to decode the base64 string
      atob(imageData);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Process a food image and return nutritional information
  async scanFoodImage(imageData: string, env: Env): Promise<any> {
    // Process the food image using Workers AI with a flexible prompt
    const response = await env.AI.run("@cf/google/gemini-pro-vision", {
      prompt: "Analyze this food image and provide nutritional information in a simple text format. Include the food name, estimated calories, proteins (g), carbohydrates (g), fat (g), and serving size if possible. Keep your response concise."
    });

    // Extract the response text
    const aiResponse = response;

    // Parse the AI response to extract nutritional information
    // Using more flexible parsing to handle variations in model output
    const foodNameMatch = aiResponse.match(/(?:food|dish|item|meal)[^:\n]*:\s*([^\n]+)/i) || 
                         aiResponse.match(/(?:it's|this is)[^:\n]*\s+([^\n]+)/i) ||
                         aiResponse.match(/^([^\n]+)/);
    
    const caloriesMatch = aiResponse.match(/(?:calories|energy|kcal)[^:\n]*:\s*(\d+)/i) ||
                         aiResponse.match(/(\d+)\s*(?:kcal|calories)/i);
    
    const proteinsMatch = aiResponse.match(/(?:proteins?|protein content)[^:\n]*:\s*(\d+(?:\.\d+)?)/i) ||
                        aiResponse.match(/(\d+(?:\.\d+)?)\s*g\s*(?:of\s*)?proteins?/i);
    
    const carbsMatch = aiResponse.match(/(?:carbohydrates?|carbs?|carb content)[^:\n]*:\s*(\d+(?:\.\d+)?)/i) ||
                      aiResponse.match(/(\d+(?:\.\d+)?)\s*g\s*(?:of\s*)?carbohydrates?/i);
    
    const fatMatch = aiResponse.match(/(?:fats?|fat content)[^:\n]*:\s*(\d+(?:\.\d+)?)/i) ||
                    aiResponse.match(/(\d+(?:\.\d+)?)\s*g\s*(?:of\s*)?fats?/i);
    
    const servingSizeMatch = aiResponse.match(/(?:serving|portion|size)[^:\n]*:\s*([^\n]+)/i);

    // Create the response object
    return {
      food_name: foodNameMatch ? foodNameMatch[1] : "Unknown",
      calories: caloriesMatch ? parseFloat(caloriesMatch[1]) : 0,
      proteins: proteinsMatch ? parseFloat(proteinsMatch[1]) : 0,
      carbohydrates: carbsMatch ? parseFloat(carbsMatch[1]) : 0,
      fat: fatMatch ? parseFloat(fatMatch[1]) : 0,
      serving_size: servingSizeMatch ? servingSizeMatch[1] : null,
      estimated_confidence: null,
      additional_notes: null
    };
  }
}

// Food scanning endpoint
router.post('/food_scan/scan', async (request, env: Env) => {
  try {
    const body = await request.json();
    const { image_data, user_id } = body;

    // Create food scan service instance
    const foodScanService = new FoodScanService();

    // Validate the image data
    if (!image_data || !foodScanService.isValidBase64Image(image_data)) {
      return json({ 
        error: 'Invalid image data. Please provide a valid base64 encoded image.'
      }, { status: 400 });
    }

    // Process the food image
    const nutritionInfo = await foodScanService.scanFoodImage(image_data, env);
    
    return json(nutritionInfo);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return json({ 
      error: `Error processing food image: ${errorMessage}` 
    }, { status: 500 });
  }
});

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
