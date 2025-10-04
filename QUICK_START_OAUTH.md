# Quick Start: Google OAuth Setup

## 🚀 Quick Setup (5 minutes)

### 1. Get Your Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create **Web Application** OAuth client:
   - Authorized redirect URIs: `http://localhost:8787/api/auth/callback/google`
3. Copy the **Client ID** and **Client Secret**

### 2. Configure Backend

```bash
cd worker

# Add the client secret (paste when prompted)
npx wrangler secret put GOOGLE_CLIENT_SECRET

# Update wrangler.toml with your Web Client ID
# GOOGLE_CLIENT_ID = "your-client-id-here.apps.googleusercontent.com"
```

### 3. Configure Frontend

Update `.env` in the root directory:

```env
EXPO_PUBLIC_API_URL=http://localhost:8787
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id-here.apps.googleusercontent.com
```

### 4. Test It!

```bash
# Terminal 1: Start backend
cd worker
npm run dev

# Terminal 2: Start frontend
npm run dev

# Terminal 3: Run on device
npm run android:dev
# or
npm run ios:dev
```

## 📱 What Happens When User Clicks "Login with Google"

```
1. App opens browser → http://localhost:8787/api/auth/sign-in/social?provider=google&callbackURL=bluby://auth/callback
2. Better Auth redirects → Google OAuth login page
3. User logs in with Google
4. Google redirects → http://localhost:8787/api/auth/callback/google?code=...
5. Better Auth creates session → Redirects to bluby://auth/callback
6. App receives deep link → Verifies session with backend
7. User is logged in! ✅
```

## 🔧 Current Implementation

### Backend (Cloudflare Workers + Better Auth)

- **File**: `worker/src/auth/index.ts`
- **Routes**: Better Auth handles all OAuth routes automatically
  - `/api/auth/sign-in/social?provider=google` - Initiates OAuth
  - `/api/auth/callback/google` - Handles Google callback
  - `/api/auth/session` - Verifies session

### Frontend (React Native + Expo)

- **Hook**: `src/hooks/useGoogleSignIn.ts`
  - Opens browser with OAuth URL
  - Listens for deep link callback
  - Verifies session with backend

- **Context**: `src/contexts/AuthProvider.tsx`
  - Integrates Google sign-in with auth store
  - Provides `signInWithGoogle()` function

- **Test Screen**: `app/(tabs)/test-auth.tsx`
  - Button to test Google login
  - Shows auth status

## 🐛 Troubleshooting

### "redirect_uri_mismatch" error

**Problem**: Google doesn't recognize your redirect URI

**Solution**: 
1. Check Google Console has: `http://localhost:8787/api/auth/callback/google`
2. Verify `BASE_URL` in `wrangler.toml` is `http://localhost:8787`
3. Restart the backend after changes

### Deep link doesn't work

**Problem**: App doesn't reopen after Google login

**Solution**:
1. Verify `app.json` has `"scheme": "bluby"`
2. Rebuild the app: `npx expo prebuild --clean`
3. Test deep link manually:
   ```bash
   # Android
   adb shell am start -W -a android.intent.action.VIEW -d "bluby://auth/callback"
   ```

### "Invalid client" error

**Problem**: Google doesn't recognize your client ID/secret

**Solution**:
1. Verify `GOOGLE_CLIENT_ID` in `wrangler.toml` matches Google Console
2. Verify `GOOGLE_CLIENT_SECRET` is set: `npx wrangler secret list`
3. Make sure you're using the **Web Client** credentials (not Android/iOS)

### Session not found after redirect

**Problem**: Backend can't find the session

**Solution**:
1. Check browser console for CORS errors
2. Verify cookies are enabled
3. Check backend logs for session creation
4. Try clearing app data and testing again

## 📝 Key Files Modified

```
worker/
  src/auth/index.ts          ← Better Auth config with Google OAuth
  wrangler.toml              ← Environment variables

src/
  hooks/useGoogleSignIn.ts   ← Google OAuth flow implementation
  contexts/AuthProvider.tsx  ← Already integrated (no changes needed)

app.json                     ← Deep linking scheme (already configured)
```

## 🎯 Next Steps

1. ✅ Set up Google OAuth credentials
2. ✅ Configure backend secrets
3. ✅ Test on development
4. 🔲 Set up production credentials
5. 🔲 Deploy to Cloudflare Workers
6. 🔲 Build production app

## 📚 Full Documentation

See `GOOGLE_OAUTH_SETUP.md` for complete setup guide including:
- Production deployment
- iOS/Android native client setup
- Security best practices
- Advanced troubleshooting
