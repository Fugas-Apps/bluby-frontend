import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { authMiddleware, AuthUser } from '../middleware/auth';
import { Env } from '../auth';

const friends = new Hono<{ Bindings: Env; Variables: { user: AuthUser } }>();

// Get friends
friends.get('/', authMiddleware, async (c) => {
  // Mock implementation
  return c.json([]);
});

// Send friend request
friends.post('/request/:userId', authMiddleware, async (c) => {
  const userId = c.req.param('userId');
  
  try {
    const userIdNum = parseInt(userId);
    if (isNaN(userIdNum)) {
      throw new HTTPException(422, { 
        message: JSON.stringify({ 
          detail: [{ loc: ['path', 'userId'], msg: 'Invalid user ID', type: 'value_error' }] 
        })
      });
    }

    // Mock implementation
    return c.json({});
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new HTTPException(500, { 
      message: JSON.stringify({ 
        detail: [{ loc: [], msg: errorMessage, type: 'server_error' }] 
      })
    });
  }
});

// Get friend requests
friends.get('/requests', authMiddleware, async (c) => {
  // Mock implementation
  return c.json([]);
});

export default friends;
