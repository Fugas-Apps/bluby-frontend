import { Router, IRequest } from 'itty-router';
import { error, json } from 'itty-router-extras';
import { D1Database, R2Bucket } from '@cloudflare/workers-types';
import { 
  ProfileDetails, 
  ProfileUpdate, 
  SuccessResponseProfileDetails,
  HTTPValidationError,
  ValidationError
} from './types';

interface Env {
  DB: D1Database;
  bluby_food_images: R2Bucket;
  bluby_user_avatars: R2Bucket;
  AI: any; // Workers AI binding
}

const router = Router();

// Authentication middleware
const withAuth = async (request: Request & { params?: any }, env: Env) => {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return json({ error: 'Missing or invalid authorization token' }, { status: 401 });
  }
  // TODO: Implement JWT verification
  // For now, we'll just extract the user ID from the token
  const token = authHeader.substring(7);
  // request.user = { id: 'user_id_from_token' }; // This would be implemented properly
};

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
  timestamp: new Date().toISOString()
}));

// === PROFILES ENDPOINTS ===

// Get a user profile by ID
router.get('/v1/profiles/:userId', async (request: IRequest, env: Env) => {
  const { userId } = request.params;
  
  try {
    const userIdNum = parseInt(userId);
    if (isNaN(userIdNum)) {
      return json({ detail: [{ loc: ['path', 'userId'], msg: 'Invalid user ID', type: 'value_error' }] }, { status: 422 });
    }

    // Query the database for user information
    const userResult: any = await env.DB.prepare(
      'SELECT id, name, goal, avatarUrl FROM Users WHERE id = ?'
    ).bind(userId).first();

    if (!userResult) {
      return json({ detail: [{ loc: ['path', 'userId'], msg: 'User not found', type: 'value_error' }] }, { status: 404 });
    }

    // Query user allergies
    const allergiesResult: any = await env.DB.prepare(
      'SELECT allergy FROM UserAllergies WHERE userId = ?'
    ).bind(userId).all();
    const allergies = allergiesResult.results ? allergiesResult.results.map((row: any) => row.allergy) : [];

    // Query user preferences
    const preferencesResult: any = await env.DB.prepare(
      'SELECT preference FROM UserPreferences WHERE userId = ?'
    ).bind(userId).all();
    const preferences = preferencesResult.results ? preferencesResult.results.map((row: any) => row.preference) : [];

    // Query user intolerances
    const intolerancesResult: any = await env.DB.prepare(
      'SELECT intolerance FROM UserIntolerances WHERE userId = ?'
    ).bind(userId).all();
    const intolerances = intolerancesResult.results ? intolerancesResult.results.map((row: any) => row.intolerance) : [];

    // Construct the profile details
    const profile: ProfileDetails = {
      user_id: userIdNum,
      username: userResult.name as string,
      bio: '', // TODO: Add bio field to Users table or create separate Profile table
      private: false, // TODO: Add privacy settings
      allow_contact_search: true // TODO: Add contact search settings
    };

    const response: SuccessResponseProfileDetails = {
      status: 'success',
      body: profile
    };

    return json(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return json({ detail: [{ loc: [], msg: errorMessage, type: 'server_error' }] }, { status: 500 });
  }
});

// Update a user profile
router.patch('/v1/profiles/:userId', async (request: IRequest, env: Env) => {
  const { userId } = request.params;
  
  try {
    const userIdNum = parseInt(userId);
    if (isNaN(userIdNum)) {
      return json({ detail: [{ loc: ['path', 'userId'], msg: 'Invalid user ID', type: 'value_error' }] }, { status: 422 });
    }

    const body = await request.json() as ProfileUpdate;

    // Update user information in the database
    if (body.bio || body.private !== undefined || body.allow_contact_search !== undefined) {
      // TODO: Implement actual database updates
      // This would require updating the Users table or a separate Profile table
    }

    // Query the updated user information
    const userResult: any = await env.DB.prepare(
      'SELECT id, name, goal, avatarUrl FROM Users WHERE id = ?'
    ).bind(userId).first();

    if (!userResult) {
      return json({ detail: [{ loc: ['path', 'userId'], msg: 'User not found', type: 'value_error' }] }, { status: 404 });
    }

    // Construct the updated profile details
    const profile: ProfileDetails = {
      user_id: userIdNum,
      username: userResult.name as string,
      bio: body.bio?.value || '',
      private: body.private || false,
      allow_contact_search: body.allow_contact_search || true
    };

    const response: SuccessResponseProfileDetails = {
      status: 'success',
      body: profile
    };

    return json(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return json({ detail: [{ loc: [], msg: errorMessage, type: 'server_error' }] }, { status: 500 });
  }
});

// === MEALS ENDPOINTS ===

// Get user meals
router.get('/v1/meals/', async (request: IRequest, env: Env) => {
  // Mock implementation
  return json([]);
});

// Create a new meal
router.post('/v1/meals/', async (request: IRequest, env: Env) => {
  // Mock implementation
  return json({});
});

// Get specific meal
router.get('/v1/meals/:mealId', async (request: IRequest, env: Env) => {
  const { mealId } = request.params;
  
  try {
    const mealIdNum = parseInt(mealId);
    if (isNaN(mealIdNum)) {
      return json({ detail: [{ loc: ['path', 'mealId'], msg: 'Invalid meal ID', type: 'value_error' }] }, { status: 422 });
    }

    // Mock implementation
    return json({});
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return json({ detail: [{ loc: [], msg: errorMessage, type: 'server_error' }] }, { status: 500 });
  }
});

// === MEAL PLANS ENDPOINTS ===

// Get meal plans
router.get('/v1/meal_plans/', async (request: IRequest, env: Env) => {
  // Mock implementation
  return json([]);
});

// Create a new meal plan
router.post('/v1/meal_plans/', async (request: IRequest, env: Env) => {
  // Mock implementation
  return json({});
});

// Get specific meal plan
router.get('/v1/meal_plans/:planId', async (request: IRequest, env: Env) => {
  const { planId } = request.params;
  
  try {
    const planIdNum = parseInt(planId);
    if (isNaN(planIdNum)) {
      return json({ detail: [{ loc: ['path', 'planId'], msg: 'Invalid plan ID', type: 'value_error' }] }, { status: 422 });
    }

    // Mock implementation
    return json({});
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return json({ detail: [{ loc: [], msg: errorMessage, type: 'server_error' }] }, { status: 500 });
  }
});

// === PANTRY ENDPOINTS ===

// Get pantry items
router.get('/v1/pantry/', async (request: IRequest, env: Env) => {
  // Mock implementation
  return json([]);
});

// Add a new pantry item
router.post('/v1/pantry/', async (request: IRequest, env: Env) => {
  // Mock implementation
  return json({});
});

// Remove a pantry item
router.delete('/v1/pantry/:itemId', async (request: IRequest, env: Env) => {
  const { itemId } = request.params;
  
  try {
    const itemIdNum = parseInt(itemId);
    if (isNaN(itemIdNum)) {
      return json({ detail: [{ loc: ['path', 'itemId'], msg: 'Invalid item ID', type: 'value_error' }] }, { status: 422 });
    }

    // Mock implementation
    return json({});
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return json({ detail: [{ loc: [], msg: errorMessage, type: 'server_error' }] }, { status: 500 });
  }
});

// === FRIENDS ENDPOINTS ===

// Get friends list
router.get('/v1/friends/', async (request: IRequest, env: Env) => {
  // Mock implementation
  return json([]);
});

// Send friend request
router.post('/v1/friends/request/:userId', async (request: IRequest, env: Env) => {
  const { userId } = request.params;
  
  try {
    const userIdNum = parseInt(userId);
    if (isNaN(userIdNum)) {
      return json({ detail: [{ loc: ['path', 'userId'], msg: 'Invalid user ID', type: 'value_error' }] }, { status: 422 });
    }

    // Mock implementation
    return json({});
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return json({ detail: [{ loc: [], msg: errorMessage, type: 'server_error' }] }, { status: 500 });
  }
});

// Get pending friend requests
router.get('/v1/friends/requests', async (request: IRequest, env: Env) => {
  // Mock implementation
  return json([]);
});

// === GROUPS ENDPOINTS ===

// Get user groups
router.get('/v1/groups/', async (request: IRequest, env: Env) => {
  // Mock implementation
  return json([]);
});

// Create a new group
router.post('/v1/groups/', async (request: IRequest, env: Env) => {
  // Mock implementation
  return json({});
});

// Get specific group
router.get('/v1/groups/:groupId', async (request: IRequest, env: Env) => {
  const { groupId } = request.params;
  
  try {
    const groupIdNum = parseInt(groupId);
    if (isNaN(groupIdNum)) {
      return json({ detail: [{ loc: ['path', 'groupId'], msg: 'Invalid group ID', type: 'value_error' }] }, { status: 422 });
    }

    // Mock implementation
    return json({});
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return json({ detail: [{ loc: [], msg: errorMessage, type: 'server_error' }] }, { status: 500 });
  }
});

// === INGREDIENTS ENDPOINTS ===

// Get ingredients
router.get('/v1/ingredients/', async (request: IRequest, env: Env) => {
  // Mock implementation
  return json([]);
});

// Create ingredient
router.post('/v1/ingredients/', async (request: IRequest, env: Env) => {
  // Mock implementation
  return json({});
});

// Get specific ingredient
router.get('/v1/ingredients/:ingredientId', async (request: IRequest, env: Env) => {
  const { ingredientId } = request.params;
  
  try {
    const ingredientIdNum = parseInt(ingredientId);
    if (isNaN(ingredientIdNum)) {
      return json({ detail: [{ loc: ['path', 'ingredientId'], msg: 'Invalid ingredient ID', type: 'value_error' }] }, { status: 422 });
    }

    // Mock implementation
    return json({});
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return json({ detail: [{ loc: [], msg: errorMessage, type: 'server_error' }] }, { status: 500 });
  }
});

// === PRODUCTS ENDPOINTS ===

// Get products
router.get('/v1/products/', async (request: IRequest, env: Env) => {
  // Mock implementation
  return json([]);
});

// Create a new product
router.post('/v1/products/', async (request: IRequest, env: Env) => {
  // Mock implementation
  return json({});
});

// Get specific product
router.get('/v1/products/:productId', async (request: IRequest, env: Env) => {
  const { productId } = request.params;
  
  try {
    const productIdNum = parseInt(productId);
    if (isNaN(productIdNum)) {
      return json({ detail: [{ loc: ['path', 'productId'], msg: 'Invalid product ID', type: 'value_error' }] }, { status: 422 });
    }

    // Mock implementation
    return json({});
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return json({ detail: [{ loc: [], msg: errorMessage, type: 'server_error' }] }, { status: 500 });
  }
});

// === PREFERENCES ENDPOINTS ===

// Get user preferences
router.get('/v1/preferences/', async (request: IRequest, env: Env) => {
  // Mock implementation
  return json({});
});

// Update user preferences
router.put('/v1/preferences/', async (request: IRequest, env: Env) => {
  // Mock implementation
  return json({});
});

// Create user preferences
router.post('/v1/preferences/', async (request: IRequest, env: Env) => {
  // Mock implementation
  return json({});
});

// === RECIPES ENDPOINTS ===

// Get recipes
router.get('/v1/recipes/', async (request: IRequest, env: Env) => {
  // Mock implementation
  return json([]);
});

// Create a new recipe
router.post('/v1/recipes/', async (request: IRequest, env: Env) => {
  // Mock implementation
  return json({});
});

// Get specific recipe
router.get('/v1/recipes/:recipeId', async (request: IRequest, env: Env) => {
  const { recipeId } = request.params;
  
  try {
    const recipeIdNum = parseInt(recipeId);
    if (isNaN(recipeIdNum)) {
      return json({ detail: [{ loc: ['path', 'recipeId'], msg: 'Invalid recipe ID', type: 'value_error' }] }, { status: 422 });
    }

    // Mock implementation
    return json({});
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return json({ detail: [{ loc: [], msg: errorMessage, type: 'server_error' }] }, { status: 500 });
  }
});

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
