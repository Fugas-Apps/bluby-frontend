import { Hono } from 'hono';
import { createAuth, Env } from '../auth';
import { getCookie } from 'hono/cookie';

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

// Better Auth handles all other auth routes automatically
auth.all('*', async (c) => {
    console.log('🔐 [AuthRoute] Incoming request:', c.req.method, c.req.url);

    // Log headers manually since Headers.entries() isn't available in this env
    const headersObj: Record<string, string> = {};
    c.req.raw.headers.forEach((value, key) => {
        headersObj[key] = value;
    });
    console.log('🔐 [AuthRoute] Headers:', headersObj);

    // Pass the Cloudflare context if available (for production)
    // In local development, cf will be undefined and the auth will use fallback config
    const authInstance = createAuth(c.env, c.req.raw.cf);

    // Convert Hono request to standard Request for Better Auth
    const standardRequest = new Request(c.req.url, {
        method: c.req.method,
        headers: new Headers(c.req.raw.headers),
        body: c.req.raw.body,
    });

    console.log('🔐 [AuthRoute] Calling Better Auth handler...');
    const response = await authInstance.handler(standardRequest);

    console.log('🔐 [AuthRoute] Better Auth response status:', response.status);

    // Log response headers manually
    const responseHeadersObj: Record<string, string> = {};
    response.headers.forEach((value, key) => {
        responseHeadersObj[key] = value;
    });
    console.log('🔐 [AuthRoute] Better Auth response headers:', responseHeadersObj);

    // Log the response body for debugging (clone first to not consume it)
    const responseClone = response.clone();
    try {
        const responseText = await responseClone.text();
        console.log('🔐 [AuthRoute] Better Auth response body:', responseText);
    } catch (e) {
        console.log('🔐 [AuthRoute] Could not read response body:', e);
    }

    return response;
});

export default auth;
