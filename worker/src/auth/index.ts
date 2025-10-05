import { betterAuth } from "better-auth";
import { withCloudflare } from "better-auth-cloudflare";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import { schema, userProfiles } from "../db/schema";
import { getTrustedOrigins } from "../utils/cors";

// Use the same Env interface as middleware to avoid type conflicts
export interface Env {
    DB: D1Database;
    KV: KVNamespace;
    bluby_food_images: R2Bucket;
    bluby_user_avatars: R2Bucket;
    bluby_user_sessions: KVNamespace;
    AI: any;
    // Google OAuth credentials
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
    // Base URL for OAuth callbacks
    BASE_URL?: string;
}

// For CLI schema generation - use development-friendly config without Cloudflare context
export const auth = betterAuth({
    database: drizzleAdapter({} as any, {
        provider: "sqlite",
        usePlural: true,
        debugLogs: true,
    }),
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        google: {
            clientId: "placeholder-client-id",
            clientSecret: "placeholder-client-secret",
        },
    },
    rateLimit: {
        enabled: true,
    },
});

// Runtime configuration
export function createAuth(env: Env, cf?: any) {
    // Create drizzle instance with schema for better-auth-cloudflare
    const db = drizzle(env.DB, { 
        schema,
        logger: true 
    });
    
    // Determine base URL for OAuth callbacks
    // In production: use your deployed URL
    // In development: use localhost
    const baseUrl = env.BASE_URL || 'http://localhost:8787';
    
    console.log('🔐 Auth base URL:', baseUrl);
    
    // Use shared CORS configuration
    // Better Auth doesn't support regex patterns, so we use '*' and rely on Hono CORS middleware for validation
    const allowedOrigins = getTrustedOrigins();

    return betterAuth({
        database: drizzleAdapter(db, {
            provider: "sqlite",
            usePlural: true,
            debugLogs: true,
        }),
        // Set base URL for OAuth callbacks
        baseURL: baseUrl,
        emailAndPassword: {
            enabled: true,
        },
        socialProviders: {
            google: {
                clientId: env.GOOGLE_CLIENT_ID || "placeholder-client-id",
                clientSecret: env.GOOGLE_CLIENT_SECRET || "placeholder-client-secret",
                // Better Auth will automatically use: {baseURL}/api/auth/callback/google
            },
        },
        secret: 'my-secret-key-for-jwt',
        session: {
            storeSessionInDatabase: false,
        },
        user: {
            // created: async (user: { id: string; email: string; }) => {
            //     try {
            //         // Create the user profile record automatically on registration
            //         await db.insert(userProfiles).values({
            //             userId: user.id,
            //             goal: null,
            //             avatarUrl: null,
            //         }).onConflictDoNothing();
            //         console.log(`Created profile for new user: ${user.email}`);
            //     } catch (error) {
            //         console.error('Error creating user profile on registration:', error);
            //     }
            // }
        },
        ...withCloudflare(
            {
                autoDetectIpAddress: true,
                geolocationTracking: true,
                cf: cf || {},
                d1: {
                    db: db as any, // Type assertion for better-auth-cloudflare compatibility
                    options: {
                        usePlural: true,
                        debugLogs: true,
                    },
                },
                kv: env.bluby_user_sessions as any, // Type assertion for KV compatibility
                r2: {
                    bucket: env.bluby_food_images as any, // Type assertion for R2 compatibility
                    maxFileSize: 10 * 1024 * 1024, // 10MB
                    allowedTypes: [".jpg", ".jpeg", ".png", ".gif", ".pdf", ".doc", ".docx"],
                    additionalFields: {
                        category: { type: "string", required: false },
                        isPublic: { type: "boolean", required: false },
                        description: { type: "string", required: false },
                    },
                },
            },
            {
                rateLimit: {
                    enabled: true,
                },
                // trustedOrigins can be a single '*' for public endpoints but that prevents cookies from working in browsers
                trustedOrigins: allowedOrigins,
            }
        ),
    });
}
