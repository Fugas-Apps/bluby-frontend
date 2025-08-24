import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { authMiddleware, AuthUser } from '../middleware/auth';
import { Env } from '../auth';

const other = new Hono<{ Bindings: Env; Variables: { user: AuthUser } }>();

// === INGREDIENTS ENDPOINTS ===
other.get('/ingredients', authMiddleware, async (c) => {
  return c.json([]);
});

other.post('/ingredients', authMiddleware, async (c) => {
  return c.json({});
});

other.get('/ingredients/:ingredientId', authMiddleware, async (c) => {
  const ingredientId = c.req.param('ingredientId');
  const ingredientIdNum = parseInt(ingredientId);
  if (isNaN(ingredientIdNum)) {
    throw new HTTPException(422, { 
      message: JSON.stringify({ 
        detail: [{ loc: ['path', 'ingredientId'], msg: 'Invalid ingredient ID', type: 'value_error' }] 
      })
    });
  }
  return c.json({});
});

// === PRODUCTS ENDPOINTS ===
other.get('/products', authMiddleware, async (c) => {
  return c.json([]);
});

other.post('/products', authMiddleware, async (c) => {
  return c.json({});
});

other.get('/products/:productId', authMiddleware, async (c) => {
  const productId = c.req.param('productId');
  const productIdNum = parseInt(productId);
  if (isNaN(productIdNum)) {
    throw new HTTPException(422, { 
      message: JSON.stringify({ 
        detail: [{ loc: ['path', 'productId'], msg: 'Invalid product ID', type: 'value_error' }] 
      })
    });
  }
  return c.json({});
});

// === PREFERENCES ENDPOINTS ===
other.get('/preferences', authMiddleware, async (c) => {
  return c.json({});
});

other.put('/preferences', authMiddleware, async (c) => {
  return c.json({});
});

other.post('/preferences', authMiddleware, async (c) => {
  return c.json({});
});

// === RECIPES ENDPOINTS ===
other.get('/recipes', authMiddleware, async (c) => {
  return c.json([]);
});

other.post('/recipes', authMiddleware, async (c) => {
  return c.json({});
});

other.get('/recipes/:recipeId', authMiddleware, async (c) => {
  const recipeId = c.req.param('recipeId');
  const recipeIdNum = parseInt(recipeId);
  if (isNaN(recipeIdNum)) {
    throw new HTTPException(422, { 
      message: JSON.stringify({ 
        detail: [{ loc: ['path', 'recipeId'], msg: 'Invalid recipe ID', type: 'value_error' }] 
      })
    });
  }
  return c.json({});
});

export default other;
