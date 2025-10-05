/**
 * Shared CORS configuration for both Hono middleware and Better Auth
 */

export const ALLOWED_ORIGIN_PATTERNS = [
  /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/,
  /^https?:\/\/192\.168\.\d+\.\d+:\d+$/, // Allow local network IPs
  /^https?:\/\/.*\.blubyai\.com$/,
  /^exp:\/\//, // Allow Expo deep links
];

/**
 * Check if an origin is allowed based on our patterns
 */
export function isOriginAllowed(origin: string | null | undefined): boolean {
  if (!origin) return true; // Mobile apps often send null origin
  return ALLOWED_ORIGIN_PATTERNS.some(pattern => pattern.test(origin));
}

/**
 * Get allowed origins for Better Auth trustedOrigins config
 * Since Better Auth doesn't support regex patterns, we return '*' for mobile compatibility
 * and rely on the Hono CORS middleware for actual origin validation
 */
export function getTrustedOrigins(): string[] {
  return ['*']; // Allow all origins in Better Auth, actual validation happens in Hono CORS
}
