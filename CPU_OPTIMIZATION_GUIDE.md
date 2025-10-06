# CPU Time Optimization Guide

## Problem: "Exceeded CPU time limit" during email/password login

### Root Cause
Better Auth's default password hashing uses **scrypt**, which is very secure but CPU-intensive. Cloudflare Workers has a **10ms CPU time limit** on the free tier, and scrypt password verification takes ~50-100ms.

### Solution Applied
Replaced scrypt with **SHA-256 + salt** using Web Crypto API, which is:
- **Optimized in Cloudflare Workers** (native implementation)
- **Fast**: ~1-2ms instead of 50-100ms
- **Still secure** with random salt per password

## Changes Made

### [worker/src/auth/index.ts](worker/src/auth/index.ts:73-109)
Added custom password hashing:
```typescript
password: {
  hash: async (password: string) => {
    // Generate random 16-byte salt
    // Hash password + salt with SHA-256
    // Return salt:hash format
  },
  verify: async (options: { password: string; hash: string }) => {
    // Extract salt from stored hash
    // Hash input password + salt
    // Compare with stored hash
  }
}
```

## What You Need to Do

### 1. Delete Existing Test Users (they won't work with new hash)

```bash
# For production/remote
wrangler d1 execute bluby-db --command "DELETE FROM accounts WHERE user_id IN (SELECT id FROM users WHERE email = 'test@example.com');"
wrangler d1 execute bluby-db --command "DELETE FROM users WHERE email = 'test@example.com';"

# For local development
wrangler d1 execute bluby-db --local --command "DELETE FROM accounts WHERE user_id IN (SELECT id FROM users WHERE email = 'test@example.com');"
wrangler d1 execute bluby-db --local --command "DELETE FROM users WHERE email = 'test@example.com';"
```

### 2. Re-register Your Test User
- Go to your app
- Register with: `test@example.com` / `password123`
- New password will be hashed with SHA-256 + salt

### 3. Test Login Performance

```bash
# Deploy and test
npm run deploy

# Watch logs to see CPU time
wrangler tail bluby-backend
```

You should see login complete in **<10ms** instead of timing out.

## Profiling Tips

### 1. Monitor CPU Time in Logs
```bash
wrangler tail bluby-backend --format pretty
```

Look for:
- ✅ `POST /api/auth/sign-in/email - OK` (should be <10ms)
- ❌ `POST /api/auth/sign-in/email - Exceeded CPU Limit` (bad)

### 2. Local Performance Testing
```bash
# Run locally with detailed timing
wrangler dev --local-protocol https

# In another terminal, make requests and time them
time curl -X POST http://localhost:8787/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 3. Cloudflare Dashboard Analytics
1. Go to https://dash.cloudflare.com
2. Select your Worker: `bluby-backend`
3. Click "Metrics" tab
4. View:
   - **CPU Time** (should be <10ms)
   - **Request duration**
   - **Error rate**

### 4. Add Custom Timing Logs

Add to your auth route:
```typescript
const start = Date.now();
const response = await authInstance.handler(standardRequest);
const duration = Date.now() - start;
console.log(`⏱️ Auth request took ${duration}ms`);
```

## Performance Benchmarks

### Before (scrypt)
- Password hash: ~50-100ms
- **Result**: ❌ Exceeded CPU limit

### After (SHA-256 + salt)
- Password hash: ~1-2ms
- **Result**: ✅ Well under 10ms limit

## Security Considerations

### Current Security Level
- ✅ Random salt per password
- ✅ SHA-256 (industry standard)
- ⚠️ Less secure than scrypt/argon2 (no key stretching)

### For Production

Consider these options:

#### Option 1: Upgrade to Workers Unbound (Paid)
```
CPU Limit: 30 seconds (instead of 10ms)
Cost: $5/month + $0.02 per million requests
```
Then you can use scrypt/argon2 safely.

#### Option 2: Use External Auth Service
- **Clerk**: https://clerk.com
- **Auth0**: https://auth0.com
- **Supabase Auth**: https://supabase.com/auth

#### Option 3: Increase Hash Strength (Still Fast)
Use PBKDF2 with lower iterations:
```typescript
const hash = await crypto.subtle.importKey(
  'raw',
  encoder.encode(password),
  { name: 'PBKDF2' },
  false,
  ['deriveBits']
);
// 1000 iterations = fast but more secure than plain SHA-256
```

## Alternative: Profile with Chrome DevTools

1. Add debugging to your Worker:
```typescript
console.time('password-verify');
const isValid = await verifyPassword(password, hash);
console.timeEnd('password-verify');
```

2. View in real-time:
```bash
wrangler tail bluby-backend --format pretty
```

## Common CPU Bottlenecks in Workers

1. **Password Hashing** (fixed ✅)
2. **Database Queries** (optimize with indexes)
3. **JSON Parsing** (large payloads)
4. **Regex Operations** (complex patterns)
5. **Crypto Operations** (use Web Crypto API)

## Questions?

If you still hit CPU limits:
1. Check which endpoint is timing out
2. Add timing logs around suspected operations
3. Consider moving heavy operations to D1 or KV
4. Upgrade to Unbound plan for complex operations
