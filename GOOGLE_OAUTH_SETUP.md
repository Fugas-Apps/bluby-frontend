# Google OAuth Setup Guide for Production App

## Overview

This guide explains how to set up Google OAuth for your production Bluby app using Better Auth with Cloudflare Workers backend.

## Architecture

```
Mobile App (Expo) → Opens Browser → Google OAuth → Backend (Cloudflare Workers/Better Auth) → Redirects to App → App Verifies Session
```

## Setup Steps

### 1. Google Cloud Console Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**

#### Configure OAuth Consent Screen (if not done)
- User Type: External
- App name: Bluby
- User support email: your-email@example.com
- Developer contact: your-email@example.com

#### Create OAuth Client IDs

You need **THREE** client IDs:

##### A. Web Client (for Better Auth backend)
- Application type: **Web application**
- Name: `Bluby Web Client`
- Authorized redirect URIs:
  ```
  http://localhost:8787/api/auth/callback/google
  https://your-production-domain.com/api/auth/callback/google
  ```
- Copy the **Client ID** and **Client Secret**

##### B. Android Client (for native app)
- Application type: **Android**
- Name: `Bluby Android`
- Package name: `com.blubyai.android` (from app.json)
- SHA-1 certificate fingerprint:
  ```bash
  # For debug builds:
  keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android
  
  # For release builds (use your actual keystore):
  keytool -list -v -keystore your-release-key.keystore -alias your-key-alias
  ```

##### C. iOS Client (for native app)
- Application type: **iOS**
- Name: `Bluby iOS`
- Bundle ID: `com.blubyai.ios` (from app.json)

### 2. Backend Configuration (Cloudflare Workers)

#### Set Environment Variables

1. **Update `wrangler.toml`** for development:
   ```toml
   [vars]
   GOOGLE_CLIENT_ID = "your-web-client-id.apps.googleusercontent.com"
   BASE_URL = "http://localhost:8787"
   ```

2. **Set the Client Secret** (never commit this!):
   ```bash
   cd worker
   npx wrangler secret put GOOGLE_CLIENT_SECRET
   # Paste your Google Client Secret when prompted
   ```

3. **For Production Deployment**:
   ```bash
   # Set production base URL
   npx wrangler secret put BASE_URL
   # Enter: https://your-production-domain.com
   
   # Set production Google Client Secret
   npx wrangler secret put GOOGLE_CLIENT_SECRET
   # Enter your production client secret
   ```

### 3. Frontend Configuration

#### Update Environment Variables

Create/update `.env` file in the root:

```env
# Development
EXPO_PUBLIC_API_URL=http://localhost:8787
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
```

For production, create `.env.production`:

```env
# Production
EXPO_PUBLIC_API_URL=https://your-production-domain.com
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
```

### 4. Deep Linking Configuration

The app is already configured with the `bluby://` scheme in `app.json`.

#### iOS Additional Setup

Add to `ios/BlubyYourFoodCompanion/Info.plist`:

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>bluby</string>
    </array>
  </dict>
</array>
```

#### Android Additional Setup

The scheme is automatically configured via `app.json`, but verify in `android/app/src/main/AndroidManifest.xml`:

```xml
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="bluby" />
</intent-filter>
```

## OAuth Flow Explained

1. **User taps "Login with Google"** in the app
2. **App opens browser** with URL: `http://localhost:8787/api/auth/sign-in/social?provider=google&callbackURL=bluby://auth/callback`
3. **Better Auth redirects** to Google OAuth
4. **User authenticates** with Google
5. **Google redirects back** to Better Auth: `http://localhost:8787/api/auth/callback/google?code=...`
6. **Better Auth processes** the OAuth code, creates a session
7. **Better Auth redirects** to the app: `bluby://auth/callback`
8. **App receives deep link** and verifies the session with the backend
9. **Backend returns user data** if session is valid
10. **App updates UI** with authenticated user

## Testing

### Development Testing

1. Start the backend:
   ```bash
   cd worker
   npm run dev
   ```

2. Start the frontend:
   ```bash
   npm run dev
   ```

3. Test on a physical device or emulator:
   ```bash
   npm run android:dev
   # or
   npm run ios:dev
   ```

4. Tap "Login with Google" and verify:
   - Browser opens with Google login
   - After authentication, app reopens
   - User is logged in

### Debugging

Check logs:
- **Backend**: Cloudflare Workers logs in terminal
- **Frontend**: Metro bundler logs and device logs
- **Deep linking**: Look for "📱 Received deep link:" in logs

Common issues:
- **"Redirect URI mismatch"**: Verify Google Console has the correct redirect URI
- **"Invalid client"**: Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
- **Deep link not working**: Verify app scheme is configured correctly
- **Session not found**: Check CORS settings and cookie handling

## Production Deployment

1. **Update Google Console** with production redirect URI
2. **Deploy backend** to Cloudflare Workers:
   ```bash
   cd worker
   npx wrangler deploy
   ```

3. **Update BASE_URL** secret:
   ```bash
   npx wrangler secret put BASE_URL
   # Enter: https://your-production-domain.com
   ```

4. **Build production app**:
   ```bash
   # For Android
   eas build --platform android --profile production
   
   # For iOS
   eas build --platform ios --profile production
   ```

## Security Considerations

- ✅ Never commit `GOOGLE_CLIENT_SECRET` to version control
- ✅ Use Cloudflare Workers secrets for sensitive data
- ✅ Validate sessions on the backend for every API request
- ✅ Use HTTPS in production
- ✅ Implement rate limiting (already configured in Better Auth)
- ✅ Keep OAuth client IDs separate for dev/prod environments

## Troubleshooting

### "Error 400: redirect_uri_mismatch"

This means Google doesn't recognize your redirect URI. Verify:
1. The redirect URI in Google Console exactly matches what Better Auth sends
2. Better Auth callback URL format: `{BASE_URL}/api/auth/callback/google`
3. No trailing slashes or typos

### Deep link doesn't open the app

1. Verify the scheme in `app.json` matches the deep link
2. Rebuild the app after changing `app.json`
3. Test the deep link manually:
   ```bash
   # Android
   adb shell am start -W -a android.intent.action.VIEW -d "bluby://auth/callback"
   
   # iOS (in Safari)
   bluby://auth/callback
   ```

### Session not persisting

Better Auth uses cookies for session management. Ensure:
1. CORS is configured to allow credentials
2. `credentials: 'include'` is set in fetch requests
3. Cookies are not blocked by the browser/WebView

## Additional Resources

- [Better Auth Documentation](https://www.better-auth.com/)
- [Expo Linking Documentation](https://docs.expo.dev/guides/linking/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
