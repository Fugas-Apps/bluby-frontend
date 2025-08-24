import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { createAuth, Env } from '../auth';

export interface AuthUser {
    id: string;
}

export const authMiddleware = async (c: Context<{ Bindings: Env; Variables: { user: AuthUser } }>, next: Next) => {
    const auth = createAuth(c.env);
    
    // Create a proper Request object from Hono request
    const standardRequest = new Request(c.req.url, {
        method: c.req.method,
        headers: new Headers(c.req.raw.headers),
        body: c.req.raw.body,
    });
    
    // Try Better Auth handler - it will handle session validation
    try {
        const authResponse = await auth.handler(standardRequest);
        if (authResponse) {
            return authResponse;
        }
    } catch (error) {
        // Auth failed, continue to original route handler
        // The route can then check for session if needed
    }
    
    await next();
};
