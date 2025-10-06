import { betterAuth } from "better-auth";
import { withCloudflare } from "better-auth-cloudflare";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import { schema, userProfiles } from "../db/schema";
import { getTrustedOrigins } from "../utils/cors";
import * as scryptPbkdf from 'scrypt-pbkdf';

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
        logger: false // Disable query logging to save CPU
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
            debugLogs: false, // Disable debug logs to save CPU
        }),
        // Set base URL for OAuth callbacks
        baseURL: baseUrl,
        // Disable advanced features to save CPU
        advanced: {
            disableCSRFCheck: true, // We handle CORS in Hono middleware
            useSecureCookies: baseUrl.startsWith('https://'),
        },
        emailAndPassword: {
            enabled: true,
            // Optimize scrypt for Cloudflare Workers CPU limits
            // Using scrypt-pbkdf with reduced N parameter
            password: {
                hash: async (password: string) => {
                    // Generate 16-byte random salt
                    const salt = scryptPbkdf.salt(16);

                    // Optimized scrypt parameters for Workers:
                    // N=2048 (much lower than default 131072) - ~2-5ms on Workers
                    // r=8 (standard)
                    // p=1 (standard)
                    const scryptParams = {
                        N: 2048,   // Lower N for faster computation
                        r: 8,
                        p: 1
                    };

                    const derivedKeyLength = 32; // 32 bytes = 256 bits

                    // Derive key using scrypt
                    const key = await scryptPbkdf.scrypt(password, salt, derivedKeyLength, scryptParams);

                    // Convert ArrayBuffers to hex strings
                    const saltHex = Array.from(new Uint8Array(salt))
                        .map(b => b.toString(16).padStart(2, '0'))
                        .join('');
                    const keyHex = Array.from(new Uint8Array(key))
                        .map(b => b.toString(16).padStart(2, '0'))
                        .join('');

                    // Return in salt:hash format (same as Better Auth default)
                    return `${saltHex}:${keyHex}`;
                },
                verify: async (options: { password: string; hash: string }) => {
                    const [saltHex, storedKeyHex] = options.hash.split(':');

                    if (!saltHex || !storedKeyHex) {
                        return false;
                    }

                    // Convert hex salt back to ArrayBuffer
                    const saltBytes = new Uint8Array(
                        saltHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
                    );

                    // Use same scrypt parameters as hash
                    const scryptParams = {
                        N: 2048,
                        r: 8,
                        p: 1
                    };

                    const derivedKeyLength = 32;

                    // Derive key from password and stored salt
                    const key = await scryptPbkdf.scrypt(
                        options.password,
                        saltBytes.buffer,
                        derivedKeyLength,
                        scryptParams
                    );

                    // Convert derived key to hex
                    const keyHex = Array.from(new Uint8Array(key))
                        .map(b => b.toString(16).padStart(2, '0'))
                        .join('');

                    // Constant-time comparison
                    return keyHex === storedKeyHex;
                }
            }
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
            storeSessionInDatabase: true, // Store sessions in D1 for mobile compatibility
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
                autoDetectIpAddress: false, // Disable to save CPU
                geolocationTracking: false, // Disable to save CPU
                cf: cf || {},
                d1: {
                    db: db as any, // Type assertion for better-auth-cloudflare compatibility
                    options: {
                        usePlural: true,
                        debugLogs: false, // Disable debug logs to save CPU
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
                    enabled: false, // Disable rate limiting to save CPU (we can add it in Hono if needed)
                },
                // trustedOrigins can be a single '*' for public endpoints but that prevents cookies from working in browsers
                trustedOrigins: allowedOrigins,
            }
        ),
    });
}
