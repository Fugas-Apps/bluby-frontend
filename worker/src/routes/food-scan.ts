import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { Env } from '../auth';
import { FoodScanService } from '../services/food-scan';

const foodScan = new Hono<{ Bindings: Env }>();

// Food scanning endpoint
foodScan.post('/scan', async (c) => {
  try {
    const body = await c.req.json();
    const { image_data, user_id } = body;

    // Create food scan service instance
    const foodScanService = new FoodScanService();

    // Validate the image data
    if (!image_data || !foodScanService.isValidBase64Image(image_data)) {
      throw new HTTPException(400, { 
        message: 'Invalid image data. Please provide a valid base64 encoded image.'
      });
    }

    // Process the food image
    const nutritionInfo = await foodScanService.scanFoodImage(image_data, c.env);
    
    return c.json(nutritionInfo);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new HTTPException(500, { 
      message: `Error processing food image: ${errorMessage}`
    });
  }
});

export default foodScan;
