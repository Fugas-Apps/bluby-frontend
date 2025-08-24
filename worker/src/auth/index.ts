import { betterAuth } from "better-auth";
import { withCloudflare } from "better-auth-cloudflare";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import { schema } from "../db/schema";

// Use the same Env interface as middleware to avoid type conflicts
export interface Env {
    DB: D1Database;
    KV: KVNamespace;
    bluby_food_images: R2Bucket;
    bluby_user_avatars: R2Bucket;
    bluby_user_sessions: KVNamespace;
    AI: any;
    // Optional runtime overrides
    ALLOWED_ORIGINS?: string;
    ALLOW_ALL_ORIGINS?: string;
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
    
    // Always use better-auth-cloudflare for both local and production
    // Build allowed origins list from env or fallback to current local defaults
    const localDefaults = [
        "http://localhost:8787",
        "http://127.0.0.1:8787",
        "http://127.0.0.1:8081",
        "http://localhost:8081",
    ];

    let allowedOrigins: string[];
    if (env.ALLOW_ALL_ORIGINS && env.ALLOW_ALL_ORIGINS.toLowerCase() === "true") {
        // WARNING: wildcard disables cookies/credentials in browsers. Use only for public, credential-less APIs.
        allowedOrigins = ["*"];
    } else if (env.ALLOWED_ORIGINS) {
        allowedOrigins = env.ALLOWED_ORIGINS
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);
    } else {
        allowedOrigins = localDefaults;
    }

    return betterAuth({
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
                emailAndPassword: {
                    enabled: true,
                },
                rateLimit: {
                    enabled: true,
                },
                // trustedOrigins can be a single '*' for public endpoints but that prevents cookies from working in browsers
                trustedOrigins: allowedOrigins,
            }
        ),
    });
}
