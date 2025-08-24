import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { authMiddleware, AuthUser } from '../middleware/auth';
import { Env } from '../auth';
import { ProfileDetails, ProfileUpdate, SuccessResponseProfileDetails } from '../types';

const profiles = new Hono<{ Bindings: Env; Variables: { user: AuthUser } }>();

// Get a user profile by ID
profiles.get('/:userId', async (c) => {
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

    // Query the database for user information
    const userResult: any = await c.env.DB.prepare(
      'SELECT id, name, goal, avatarUrl FROM Users WHERE id = ?'
    ).bind(userId).first();

    if (!userResult) {
      throw new HTTPException(404, { 
        message: JSON.stringify({ 
          detail: [{ loc: ['path', 'userId'], msg: 'User not found', type: 'value_error' }] 
        })
      });
    }

    // Query user allergies
    const allergiesResult: any = await c.env.DB.prepare(
      'SELECT allergy FROM UserAllergies WHERE userId = ?'
    ).bind(userId).all();
    const allergies = allergiesResult.results ? allergiesResult.results.map((row: any) => row.allergy) : [];

    // Query user preferences
    const preferencesResult: any = await c.env.DB.prepare(
      'SELECT preference FROM UserPreferences WHERE userId = ?'
    ).bind(userId).all();
    const preferences = preferencesResult.results ? preferencesResult.results.map((row: any) => row.preference) : [];

    // Query user intolerances
    const intolerancesResult: any = await c.env.DB.prepare(
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

    return c.json(response);
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

// Update a user profile
profiles.patch('/:userId', authMiddleware, async (c) => {
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

    const body = await c.req.json() as ProfileUpdate;

    // Update user information in the database
    if (body.bio || body.private !== undefined || body.allow_contact_search !== undefined) {
      // TODO: Implement actual database updates
      // This would require updating the Users table or a separate Profile table
    }

    // Query the updated user information
    const userResult: any = await c.env.DB.prepare(
      'SELECT id, name, goal, avatarUrl FROM Users WHERE id = ?'
    ).bind(userId).first();

    if (!userResult) {
      throw new HTTPException(404, { 
        message: JSON.stringify({ 
          detail: [{ loc: ['path', 'userId'], msg: 'User not found', type: 'value_error' }] 
        })
      });
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

    return c.json(response);
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

export default profiles;
