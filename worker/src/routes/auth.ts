import { Hono } from 'hono';
import { createAuth, Env } from '../auth';

const auth = new Hono<{ Bindings: Env }>();

// Better Auth handles all auth routes automatically
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
