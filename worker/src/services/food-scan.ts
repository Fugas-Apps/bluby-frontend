import { Env } from '../auth';

export class FoodScanService {
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
