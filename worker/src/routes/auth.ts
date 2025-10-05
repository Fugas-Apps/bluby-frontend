import { Hono } from 'hono';
import { createAuth, Env } from '../auth';
import { getCookie } from 'hono/cookie';

const auth = new Hono<{ Bindings: Env }>();

// Intercept OAuth callback to extract session token for mobile apps
auth.get('/callback/google', async (c) => {
    const authInstance = createAuth(c.env, c.req.raw.cf);

    // Let Better Auth handle the OAuth callback first
    const standardRequest = new Request(c.req.url, {
        method: c.req.method,
        headers: new Headers(c.req.raw.headers),
    });

    const response = await authInstance.handler(standardRequest);

    // If the response is a redirect (302), extract the session token
    if (response.status === 302) {
        // Get the session cookie that Better Auth just set
        const setCookieHeader = response.headers.get('set-cookie');
        let sessionToken = null;

        if (setCookieHeader) {
            // Parse the session cookie - Better Auth typically uses 'better-auth.session_token'
            const tokenMatch = setCookieHeader.match(/better-auth\.session_token=([^;]+)/);
            if (tokenMatch) {
                sessionToken = tokenMatch[1];
            }
        }

        // Get the original callback URL from the verification data
        const location = response.headers.get('location');

        if (sessionToken && location) {
            // Append the session token to the redirect URL
            const redirectUrl = new URL(location);
            redirectUrl.searchParams.set('session_token', sessionToken);

            console.log('📱 Redirecting to mobile app with session token');

            // Return a new redirect response with the token
            return new Response(null, {
                status: 302,
                headers: {
                    'Location': redirectUrl.toString(),
                },
            });
        }
    }

    // If not a redirect or no token found, return the original response
    return response;
});

// Better Auth handles all other auth routes automatically
auth.all('*', async (c) => {
    // Pass the Cloudflare context if available (for production)
    // In local development, cf will be undefined and the auth will use fallback config
    const authInstance = createAuth(c.env, c.req.raw.cf);

    // Convert Hono request to standard Request for Better Auth
    const standardRequest = new Request(c.req.url, {
        method: c.req.method,
        headers: new Headers(c.req.raw.headers),
        body: c.req.raw.body,
    });

    return authInstance.handler(standardRequest);
});

export default auth;
