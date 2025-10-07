import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { createAuth, Env } from '../auth';

export interface AuthUser {
    id: string;
    name?: string;
    email?: string;
    image?: string;
}

export const authMiddleware = async (c: Context<{ Bindings: Env; Variables: { user: AuthUser } }>, next: Next) => {
    const auth = createAuth(c.env);

    // Create a proper Request object from Hono request
    const standardRequest = new Request(c.req.url, {
        method: c.req.method,
        headers: new Headers(c.req.raw.headers),
        body: c.req.raw.body,
    });

    console.log('🔐 Auth middleware - checking session for:', c.req.url);
    const headers: Record<string, string> = {};
    standardRequest.headers.forEach((v, k) => {
        headers[k] = k.toLowerCase() === 'authorization' ? '[REDACTED]' : v;
    });
    console.log('🔐 Headers:', headers);

    // DEV-ONLY: Check for dummy session token
    const authHeader = standardRequest.headers.get('authorization');
    if (authHeader && authHeader === 'Bearer dummysession1234') {
        console.log('🔧 [DEV] Using dummy session token, bypassing auth');
        // Set dev user in context
        c.set('user', {
            id: 'dev-user-id',
            name: 'Test User',
            email: 'testuser@blubyai.com',
        });
        console.log('✅ [DEV] Dev session validated, proceeding with dev user');
        await next();
        return;
    }

    // Check for session to authenticate API routes
    let session = await auth.api.getSession({ headers: standardRequest.headers });

    // If getSession fails, try querying KV directly with the token as session ID
    if (!session?.user) {
        console.log('🔐 getSession failed, trying KV lookup');
        const authHeader = standardRequest.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.slice(7);
            try {
                console.log('🔐 Looking up session in KV:', token);
                const sessionData = await c.env.bluby_user_sessions.get(token);
                console.log('🔐 KV session data:', sessionData);
                if (sessionData) {
                    const parsed = JSON.parse(sessionData);
                    console.log('🔐 Parsed session:', parsed);
                    if (parsed.user) {
                        session = parsed;
                    }
                }
            } catch (error) {
                console.log('🔐 KV lookup error:', error);
            }
        }
    }

    console.log('🔐 Session result:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
    });

    if (!session?.user) {
        console.log('❌ No valid session found, returning 401');
        return c.json({ error: 'Unauthorized' }, 401);
    }

    // Set user in context for route handlers
    c.set('user', {
        id: session.user.id,
        name: session.user.name ?? undefined,
        email: session.user.email ?? undefined,
        image: session.user.image ?? undefined,
    });

    console.log('✅ Session validated, proceeding with user:', c.var.user.id);

    await next();
};
