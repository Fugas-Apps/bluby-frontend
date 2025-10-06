# Password Hashing Migration Notice

## What Changed

To fix the "Exceeded CPU time limit" error during email/password login, we switched from **scrypt** (CPU-intensive) to **SHA-256** (optimized for Cloudflare Workers).

## What You Need to Do

### Option 1: Delete and Re-register Test Users (RECOMMENDED for development)

```bash
# Delete the test user from your database
wrangler d1 execute bluby-db --local --command "DELETE FROM accounts WHERE user_id IN (SELECT id FROM users WHERE email = 'test@example.com');"
wrangler d1 execute bluby-db --local --command "DELETE FROM users WHERE email = 'test@example.com';"

# Then re-register in your app
```

### Option 2: Reset All Users (if you have multiple test users)

```bash
# Clear all users and accounts
wrangler d1 execute bluby-db --local --command "DELETE FROM sessions;"
wrangler d1 execute bluby-db --local --command "DELETE FROM accounts;"
wrangler d1 execute bluby-db --local --command "DELETE FROM users;"

# Then re-register all users
```

## Why This Happened

- **Before**: Better Auth used scrypt (secure but slow) - exceeded Cloudflare Workers 10ms CPU limit
- **After**: Using Web Crypto API SHA-256 (fast, optimized for Workers)

## Security Note

SHA-256 alone is less secure than scrypt for password hashing in production. For production, consider:

1. Using Cloudflare Workers **Unbound** plan (30 seconds CPU limit instead of 10ms)
2. Adding a salt to SHA-256 hashing
3. Using a dedicated auth service like Clerk or Auth0
4. Moving password verification to a separate service

For now, this solution works for development and testing.
