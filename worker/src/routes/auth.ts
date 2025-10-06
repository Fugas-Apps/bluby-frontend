import { Hono } from 'hono';
import { createAuth, Env } from '../auth';
import { getCookie } from 'hono/cookie';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { sessions } from '../db/schema';

const auth = new Hono<{ Bindings: Env }>();

// Intercept OAuth callback to extract session token for mobile apps
auth.get('/callback/google', async (c) => {
    console.log('📱 [GoogleCallback] OAuth callback received');

    const authInstance = createAuth(c.env, c.req.raw.cf);

    // Let Better Auth handle the OAuth callback first
    const standardRequest = new Request(c.req.url, {
        method: c.req.method,
        headers: new Headers(c.req.raw.headers),
    });

    console.log('📱 [GoogleCallback] Calling Better Auth handler...');
    const response = await authInstance.handler(standardRequest);
    console.log('📱 [GoogleCallback] Better Auth response status:', response.status);

    // If the response is a redirect (302), we need to get the session for mobile apps
    if (response.status === 302) {
        console.log('📱 [GoogleCallback] Redirect detected, extracting session...');

        // Get the session cookie that Better Auth just set
        const setCookieHeader = response.headers.get('set-cookie');
        console.log('📱 [GoogleCallback] Set-Cookie header:', setCookieHeader);

        // Get the location header to extract callback URL
        const location = response.headers.get('location');
        console.log('📱 [GoogleCallback] Location header:', location);

        if (setCookieHeader && location) {
            // Use the auth instance to get the current session using the cookie
            const sessionRequest = new Request(c.req.url, {
                method: 'GET',
                headers: new Headers({
                    'Cookie': setCookieHeader.split(';')[0], // Use the cookie that was just set
                }),
            });

            console.log('📱 [GoogleCallback] Fetching session with cookie:', setCookieHeader.split(';')[0]);

            try {
                const session = await authInstance.api.getSession({
                    headers: sessionRequest.headers
                });

                console.log('📱 [GoogleCallback] Session retrieved:', JSON.stringify(session, null, 2));

                if (session?.session?.token) {
                    // Found the actual session token! Append it to the callback URL
                    const redirectUrl = new URL(location);
                    redirectUrl.searchParams.set('session_token', setCookieHeader.split(';')[0]);

                    console.log('📱 [GoogleCallback] Redirecting to:', redirectUrl.toString());
                    return Response.redirect(redirectUrl.toString());
                } else {
                    console.error('❌ [GoogleCallback] No session found');
                    return new Response('No session found', { status: 500 });
                }
            } catch (error) {
                console.error('📱 [GoogleCallback] Error getting session:', error);
            }
        } else {
            console.error('📱 [GoogleCallback] Missing set-cookie or location header');
        }
    }

    // If not a redirect or no token found, return the original response
    console.log('📱 [GoogleCallback] Returning original response');
    return response;
});

// KV session endpoint - bypass Better Auth to query KV directly
auth.get('/kv-session/:token', async (c) => {
    console.log('🔍 [KVSession] Direct KV session query for token:', c.req.param('token'));
    
    const token = c.req.param('token');
    
    if (!token) {
        console.error('❌ [KVSession] No token provided');
        return c.json({ error: 'No token provided' }, 400);
    }
    
    try {
        // Query KV directly using the binding
        const kvKey = `session:${token}`;
        console.log('🔍 [KVSession] Querying KV key:', kvKey);
        
        // First try with session: prefix
        let sessionData = await c.env.bluby_user_sessions.get(kvKey);
        
        if (!sessionData) {
            // Try without prefix if not found
            console.log('🔍 [KVSession] Not found with prefix, trying without...');
            sessionData = await c.env.bluby_user_sessions.get(token);
            console.log('🔍 [KVSession] Querying KV key without prefix:', token);
        }
        
        if (!sessionData) {
            console.error('❌ [KVSession] No session found in KV for token:', token);
            // List some keys to debug
            try {
                const list = await c.env.bluby_user_sessions.list({ limit: 5 });
                console.log('🔍 [KVSession] Available keys:', list.keys.map(k => k.name));
            } catch (listError) {
                console.error('🔍 [KVSession] Could not list keys:', listError);
            }
            return c.json({ error: 'Session not found' }, 404);
        }
        
        console.log('✅ [KVSession] Found session data in KV');
        
        // Parse the JSON session data
        let parsedSession;
        try {
            parsedSession = JSON.parse(sessionData);
            console.log('✅ [KVSession] Parsed session data:', JSON.stringify(parsedSession, null, 2));
        } catch (parseError) {
            console.error('❌ [KVSession] Failed to parse KV session data:', parseError);
            return c.json({ error: 'Invalid session data format' }, 500);
        }
        
        // Return the session data in the expected format
        return c.json({
            user: parsedSession.user,
            session: parsedSession.session,
        });
        
    } catch (error) {
        console.error('❌ [KVSession] Error querying KV:', error);
        return c.json({ error: 'Failed to query session' }, 500);
    }
});

// Custom delete-session endpoint for manual Google OAuth sign-out
// This replicates what Better Auth's /sign-out endpoint does but works for mobile apps
auth.post('/delete-session', async (c) => {
    console.log('🗑️ [DeleteSession] Manual session deletion request');

    try {
        const body = await c.req.json();
        const { sessionToken } = body;

        if (!sessionToken) {
            console.error('❌ [DeleteSession] No session token provided');
            return c.json({ error: 'Session token is required' }, 400);
        }

        console.log('🔑 [DeleteSession] Deleting session with token:', sessionToken.substring(0, 10) + '...');

        // Create drizzle instance
        const db = drizzle(c.env.DB);

        // Delete the session from the database
        await db.delete(sessions)
            .where(eq(sessions.token, sessionToken))
            .execute();

        console.log('✅ [DeleteSession] Session deleted from database');

        // Also try to delete from KV if it's stored there
        try {
            await c.env.bluby_user_sessions.delete(`session:${sessionToken}`);
            await c.env.bluby_user_sessions.delete(sessionToken);
            console.log('✅ [DeleteSession] Session deleted from KV');
        } catch (kvError) {
            console.error('⚠️ [DeleteSession] Error deleting from KV (non-fatal):', kvError);
        }

        return c.json({ success: true });

    } catch (error) {
        console.error('❌ [DeleteSession] Error deleting session:', error);
        return c.json({
            error: 'Failed to delete session',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, 500);
    }
});

// Better Auth handles all other auth routes automatically
auth.all('*', async (c) => {
    // Minimal logging to save CPU time
    // Only log the request method and path
    console.log('🔐 [AuthRoute]', c.req.method, new URL(c.req.url).pathname);

    // Pass the Cloudflare context if available (for production)
    const authInstance = createAuth(c.env, c.req.raw.cf);

    // Convert Hono request to standard Request for Better Auth
    const standardRequest = new Request(c.req.url, {
        method: c.req.method,
        headers: new Headers(c.req.raw.headers),
        body: c.req.raw.body,
    });

    const response = await authInstance.handler(standardRequest);

    // Only log errors
    if (response.status >= 400) {
        console.log('❌ [AuthRoute] Error status:', response.status);
    }

    return response;
});

export default auth;
