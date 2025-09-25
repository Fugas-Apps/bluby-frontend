import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { authMiddleware } from '../middleware/auth';
import { Env } from '../auth';
import { eq, and } from 'drizzle-orm';
import { getDb } from '../db';
import { userProfiles, userPreferences, userAllergies, userIntolerances } from '../db/schema';
import { ProfileDetails, ProfileUpdate, SuccessResponseProfileDetails } from '../types';
import { createAuth } from '../auth';

import { AuthUser } from '../middleware/auth';

const profiles = new Hono<{ Bindings: Env; Variables: { user: AuthUser } }>();

// simple request logger (safe clone so body is not consumed)
// redacts Authorization header
profiles.use('*', async (c, next) => {
  try {
    const rawReq = (c.req as any).raw as Request | undefined;
    const reqToRead = rawReq ?? (c.req as any).request ?? undefined;
    if (reqToRead) {
      const cloned = reqToRead.clone();
      const bodyText = await cloned.text().catch(() => null);
      const headers: Record<string, string> = {};
      (reqToRead.headers || new Headers()).forEach?.((v: string, k: string) => {
        headers[k] = k.toLowerCase() === 'authorization' ? '[REDACTED]' : v;
      });
      console.log('Incoming request:', JSON.stringify({
        method: reqToRead.method,
        url: reqToRead.url,
        headers,
        body: bodyText || null,
      }, null, 2));
    } else {
      console.log('Incoming request: could not access raw Request object');
    }
  } catch (err) {
    console.warn('Request logging failed:', err);
  }
  await next();
});

// Get a user profile by ID (returns complete profile data)
profiles.get('/:userId', authMiddleware, async (c) => {
  const user = c.var.user;
  const requestedUserId = c.req.param('userId');

  console.log('🔍 Profile GET request:', {
    requestedUserId,
    requestedUserIdType: typeof requestedUserId,
    userId: user.id,
    userIdType: typeof user.id,
    userName: user.name,
    userEmail: user.email,
  });

  // Ensure user can only access their own data
  const isOwnData = requestedUserId === user.id;
  const isOwnDataToString = requestedUserId === user.id.toString();
  console.log('🔒 Authorization check:', {
    isOwnData,
    isOwnDataToString,
    willDeny: !isOwnData && !isOwnDataToString,
  });

  if (requestedUserId !== user.id && requestedUserId !== user.id.toString()) {
    console.log('❌ Unauthorized access attempt:', {
      requestedUserId,
      userId: user.id,
      reason: 'User ID mismatch',
    });
    return c.json({ error: 'Unauthorized' }, 403);
  }

  console.log('✅ Authorization passed, proceeding with profile fetch');

  try {
    const db = await getDb(c.env);
    console.log('🗄️ Database connection established');

    // Create a basic profile record if it doesn't exist
    // NOTE: This might get removed, though? AI slop
    const existingProfile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, user.id))
      .limit(1);

    console.log('📋 Existing profile check:', {
      found: existingProfile.length > 0,
      userId: user.id,
    });

    if (existingProfile.length === 0) {
      console.log('🆕 Creating new profile record for user:', user.id);
      await db.insert(userProfiles).values({
        userId: user.id,
        goal: null,
        avatarUrl: null,
      });
    }

    // Get profile data from user_profiles table
    const profileData = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, user.id))
      .limit(1);

    console.log('📊 Profile data retrieved:', {
      hasData: profileData.length > 0,
      goal: profileData.length > 0 ? profileData[0].goal : null,
      avatarUrl: profileData.length > 0 ? profileData[0].avatarUrl : null,
    });

    // Get user preferences
    const preferences = await db
      .select({ preference: userPreferences.preference })
      .from(userPreferences)
      .where(eq(userPreferences.userId, user.id));

    console.log('🍽️ User preferences:', preferences.map(p => p.preference));

    // Get user allergies
    const allergies = await db
      .select({ allergy: userAllergies.allergy })
      .from(userAllergies)
      .where(eq(userAllergies.userId, user.id));

    console.log('🤧 User allergies:', allergies.map(a => a.allergy));

    // Get user intolerances
    const intolerances = await db
      .select({ intolerance: userIntolerances.intolerance })
      .from(userIntolerances)
      .where(eq(userIntolerances.userId, user.id));

    console.log('🚫 User intolerances:', intolerances.map(i => i.intolerance));

    // Construct complete profile response
    const profile = {
      userId: user.id,
      name: user.name,
      email: user.email,
      goal: profileData.length > 0 ? profileData[0].goal : null,
      avatarUrl: profileData.length > 0 ? profileData[0].avatarUrl : null,
      preferences: preferences.map(p => p.preference),
      allergies: allergies.map(a => a.allergy),
      intolerances: intolerances.map(i => i.intolerance),
      nutritionGoals: null,
    };

    console.log('📤 Returning profile data:', {
      userId: profile.userId,
      name: profile.name,
      email: profile.email,
      preferencesCount: profile.preferences.length,
      allergiesCount: profile.allergies.length,
      intolerancesCount: profile.intolerances.length,
    });

    return c.json(profile);
  } catch (error) {
    console.error('❌ Error fetching profile:', error);
    return c.json({ error: 'Failed to fetch profile' }, 500);
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

// GET user preferences
profiles.get('/:userId/preferences', authMiddleware, async (c) => {
  const user = c.var.user;
  const requestedUserId = c.req.param('userId');

  // Ensure user can only access their own data or alphanumeric IDs if needed
  if (requestedUserId !== user.id && requestedUserId !== user.id.toString()) {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  try {
    const db = await getDb(c.env);
    const preferences = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, user.id));

    return c.json({
      preferences: preferences.map(p => p.preference)
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return c.json({ error: 'Failed to fetch preferences' }, 500);
  }
});

// POST add preference
profiles.post('/:userId/preferences', authMiddleware, async (c) => {
  const user = c.var.user;
  const requestedUserId = c.req.param('userId');
  const { preference } = await c.req.json();

  if (requestedUserId !== user.id && requestedUserId !== user.id.toString()) {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  if (!preference || typeof preference !== 'string') {
    return c.json({ error: 'Preference is required' }, 400);
  }

  try {
    const db = await getDb(c.env);
    await db.insert(userPreferences).values({
      userId: user.id,
      preference: preference.trim(),
    });

    return c.json({ success: true, preference });
  } catch (error) {
    console.error('Error adding preference:', error);
    return c.json({ error: 'Failed to add preference' }, 500);
  }
});

// DELETE remove preference
profiles.delete('/:userId/preferences/:preference', authMiddleware, async (c) => {
  const user = c.var.user;
  const requestedUserId = c.req.param('userId');
  const preference = decodeURIComponent(c.req.param('preference'));

  if (requestedUserId !== user.id && requestedUserId !== user.id.toString()) {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  try {
    const db = await getDb(c.env);
    const result = await db
      .delete(userPreferences)
      .where(and(
        eq(userPreferences.userId, user.id),
        eq(userPreferences.preference, preference)
      ))
      .returning();

    if (result.length === 0) {
      return c.json({ error: 'Preference not found' }, 404);
    }

    return c.json({ success: true, preference });
  } catch (error) {
    console.error('Error removing preference:', error);
    return c.json({ error: 'Failed to remove preference' }, 500);
  }
});

// GET user allergies
profiles.get('/:userId/allergies', authMiddleware, async (c) => {
  const user = c.var.user;
  const requestedUserId = c.req.param('userId');

  if (requestedUserId !== user.id && requestedUserId !== user.id.toString()) {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  try {
    const db = await getDb(c.env);
    const allergies = await db
      .select()
      .from(userAllergies)
      .where(eq(userAllergies.userId, user.id));

    return c.json({
      allergies: allergies.map(a => a.allergy)
    });
  } catch (error) {
    console.error('Error fetching allergies:', error);
    return c.json({ error: 'Failed to fetch allergies' }, 500);
  }
});

// POST add allergy
profiles.post('/:userId/allergies', authMiddleware, async (c) => {
  const user = c.var.user;
  const requestedUserId = c.req.param('userId');
  const { allergy } = await c.req.json();

  if (requestedUserId !== user.id && requestedUserId !== user.id.toString()) {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  if (!allergy || typeof allergy !== 'string') {
    return c.json({ error: 'Allergy is required' }, 400);
  }

  try {
    const db = await getDb(c.env);
    await db.insert(userAllergies).values({
      userId: user.id,
      allergy: allergy.trim(),
    });

    return c.json({ success: true, allergy });
  } catch (error) {
    console.error('Error adding allergy:', error);
    return c.json({ error: 'Failed to add allergy' }, 500);
  }
});

// DELETE remove allergy
profiles.delete('/:userId/allergies/:allergy', authMiddleware, async (c) => {
  const user = c.var.user;
  const requestedUserId = c.req.param('userId');
  const allergy = decodeURIComponent(c.req.param('allergy'));

  if (requestedUserId !== user.id && requestedUserId !== user.id.toString()) {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  try {
    const db = await getDb(c.env);
    const result = await db
      .delete(userAllergies)
      .where(and(
        eq(userAllergies.userId, user.id),
        eq(userAllergies.allergy, allergy)
      ))
      .returning();

    if (result.length === 0) {
      return c.json({ error: 'Allergy not found' }, 404);
    }

    return c.json({ success: true, allergy });
  } catch (error) {
    console.error('Error removing allergy:', error);
    return c.json({ error: 'Failed to remove allergy' }, 500);
  }
});

// GET user intolerances
profiles.get('/:userId/intolerances', authMiddleware, async (c) => {
  const user = c.var.user;
  const requestedUserId = c.req.param('userId');

  if (requestedUserId !== user.id && requestedUserId !== user.id.toString()) {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  try {
    const db = await getDb(c.env);
    const intolerances = await db
      .select()
      .from(userIntolerances)
      .where(eq(userIntolerances.userId, user.id));

    return c.json({
      intolerances: intolerances.map(i => i.intolerance)
    });
  } catch (error) {
    console.error('Error fetching intolerances:', error);
    return c.json({ error: 'Failed to fetch intolerances' }, 500);
  }
});

// POST add intolerance
profiles.post('/:userId/intolerances', authMiddleware, async (c) => {
  const user = c.var.user;
  const requestedUserId = c.req.param('userId');
  const { intolerance } = await c.req.json();

  if (requestedUserId !== user.id && requestedUserId !== user.id.toString()) {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  if (!intolerance || typeof intolerance !== 'string') {
    return c.json({ error: 'Intolerance is required' }, 400);
  }

  try {
    const db = await getDb(c.env);
    await db.insert(userIntolerances).values({
      userId: user.id,
      intolerance: intolerance.trim(),
    });

    return c.json({ success: true, intolerance });
  } catch (error) {
    console.error('Error adding intolerance:', error);
    return c.json({ error: 'Failed to add intolerance' }, 500);
  }
});

// DELETE remove intolerance
profiles.delete('/:userId/intolerances/:intolerance', authMiddleware, async (c) => {
  const user = c.var.user;
  const requestedUserId = c.req.param('userId');
  const intolerance = decodeURIComponent(c.req.param('intolerance'));

  if (requestedUserId !== user.id && requestedUserId !== user.id.toString()) {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  try {
    const db = await getDb(c.env);
    const result = await db
      .delete(userIntolerances)
      .where(and(
        eq(userIntolerances.userId, user.id),
        eq(userIntolerances.intolerance, intolerance)
      ))
      .returning();

    if (result.length === 0) {
      return c.json({ error: 'Intolerance not found' }, 404);
    }

    return c.json({ success: true, intolerance });
  } catch (error) {
    console.error('Error removing intolerance:', error);
    return c.json({ error: 'Failed to remove intolerance' }, 500);
  }
});

export default profiles;
