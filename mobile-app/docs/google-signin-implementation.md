# Google Sign In Implementation

## Overview

This app implements Google Sign In using the **Universal Google One-Tap Sign In** flow from [@react-native-google-signin/google-signin](https://react-native-google-signin.github.io/docs/one-tap). This is Google's recommended authentication method and works seamlessly across Android, iOS, and web platforms.

## Implementation Details

### Library Used
- **Package**: `@react-native-google-signin/google-signin` (latest)
- **Flow**: Universal Google One-Tap Sign In (GoogleOneTapSignIn)
- **Image Library**: `expo-image` for displaying the Google icon

### Key Files

#### 1. `src/lib/google-signin.ts`
Central Google Sign In logic handler with:
- **`configureGoogleSignIn()`** - Initializes Google Sign In with auto-detection of webClientId
- **`handleGoogleSignIn()`** - Manages the complete sign-in flow:
  1. Attempts automatic sign-in with saved credentials (`signIn()`)
  2. If no saved credentials, prompts account creation (`createAccount()`)
  3. If no Google account on device, shows explicit sign-in (`presentExplicitSignIn()`)
  4. Exchanges Google ID token with Better Auth backend
- **`handleGoogleSignOut()`** - Signs out from Google

#### 2. `src/components/GoogleSignInButton.tsx`
Reusable Google Sign In button component featuring:
- Google icon loaded from URL via expo-image
- Loading state with ActivityIndicator
- Consistent styling matching the app theme
- Disabled state support
- Customizable label text

#### 3. `src/constants/index.ts`
Contains the Google icon URL:
```typescript
export const GOOGLE_ICON_URL = 'https://img.icons8.com/fluency/48/google-logo.png'
```

### Integration Points

#### Sign In Screen (`src/app/(auth)/sign-in.tsx`)
- Google Sign In button placed below email/password form
- Separated by "OR" divider
- Label: "Sign in with Google"
- Configures Google Sign In on component mount
- On success, navigates to main app `/(tabs)`

#### Sign Up Screen (`src/app/(auth)/sign-up.tsx`)
- Google Sign In button placed below registration form
- Separated by "OR" divider
- Label: "Sign up with Google"
- Shares same flow as sign-in (Google handles both cases)
- On success, navigates to main app `/(tabs)`

#### Root Layout (`src/app/_layout.tsx`)
- Configures Google Sign In when app starts
- Ensures Google Sign In is ready before any auth screens load

## Authentication Flow

### 1. **Automatic Sign In** (First Attempt)
```
User opens app → signIn() → Success → Better Auth → Navigate to app
                           ↓ No saved credentials
                           Continue to step 2
```

### 2. **Account Creation** (Second Attempt)
```
No saved credentials → createAccount() → User selects account → Success → Better Auth → Navigate
                                                              ↓ User cancels
                                                              Return cancelled state
```

### 3. **Explicit Sign In** (Fallback)
```
No Google account → presentExplicitSignIn() → Add account prompt → Success → Better Auth → Navigate
```

### 4. **Better Auth Integration**
```
Google ID Token → authClient.signIn.social({ provider: 'google', idToken }) → Success/Error
```

## Error Handling

The implementation handles various error scenarios:

- **`ONE_TAP_START_FAILED`**: Rate limiting hit, suggests using explicit sign-in
- **`PLAY_SERVICES_NOT_AVAILABLE`**: Google Play Services outdated/unavailable (Android)
- **User Cancellation**: Gracefully handled, no error shown
- **Network Errors**: Caught and displayed to user
- **Better Auth Errors**: Displayed via Alert dialogs

## Configuration

### Auto-Detection
The implementation uses `webClientId: 'autoDetect'` which automatically detects:
- **Android**: From `google-services.json`
- **iOS**: From `GoogleService-Info.plist` (requires `WEB_CLIENT_ID` key)
- **iosClientId**: Auto-detected from GoogleService-Info.plist

### Setup Requirements

1. **Android** (`android/app/google-services.json`):
   - Already contains web client ID
   - No additional setup needed

2. **iOS** (`ios/rendercondemo2025/GoogleService-Info.plist`):
   - Add `WEB_CLIENT_ID` entry:
   ```xml
   <key>WEB_CLIENT_ID</key>
   <string>your-web-client-id.apps.googleusercontent.com</string>
   ```

3. **Better Auth Backend**:
   - Must support Google OAuth provider
   - Endpoint: `authClient.signIn.social()`
   - Accepts `provider: 'google'` and `idToken`

## User Experience

### Visual Design
- **Button Style**: White background with gray border
- **Icon**: 24x24 Google logo from Icons8
- **Loading State**: Spinner replaces icon during authentication
- **Disabled State**: 60% opacity when other auth is in progress

### Interaction Flow
1. User taps "Sign in with Google" / "Sign up with Google"
2. Button shows loading spinner
3. Google presents account picker (or auto-signs in)
4. App exchanges token with backend
5. User navigated to main app on success
6. Errors shown via native Alert dialogs

## Platform Support

| Platform | Implementation | Notes |
|----------|---------------|-------|
| **Android** | Credential Manager APIs | Requires Google Play Services |
| **iOS** | Google Sign In SDK | Native iOS sign-in flow |
| **macOS** | Google Sign In SDK | Same as iOS |
| **Web** | One-tap + Google Sign-In button | Requires Google Client Library |

## Security Features

- **ID Token Validation**: Better Auth validates Google ID tokens server-side
- **Secure Storage**: Credentials managed by platform (Keychain/Keystore)
- **Auto-refresh**: Tokens automatically refreshed when expired
- **Sign Out**: Complete sign-out from Google account

## Testing

To test Google Sign In:

1. **Development**:
   - Ensure Firebase configuration files are in place
   - Run `yarn android` or `yarn ios`
   - Tap Google Sign In button
   - Select a Google account

2. **Edge Cases to Test**:
   - No Google accounts on device
   - User cancels sign-in
   - Network disconnected
   - Rate limiting (multiple rapid attempts)
   - Expired tokens

## Troubleshooting

### Common Issues

1. **"Google Sign In is temporarily unavailable"**
   - Cause: Rate limiting (`ONE_TAP_START_FAILED`)
   - Solution: Wait a moment, use email sign-in, or tap explicit sign-in button

2. **"Google Play Services Required"**
   - Cause: Outdated or missing Play Services (Android)
   - Solution: Update Google Play Services from Play Store

3. **Configuration errors**
   - Verify `google-services.json` and `GoogleService-Info.plist` are present
   - Check `WEB_CLIENT_ID` is added to iOS plist
   - Ensure Better Auth backend has Google OAuth configured

4. **Token validation errors**
   - Verify backend Google OAuth client ID matches app configuration
   - Check server-side Google OAuth setup

## References

- [Universal Google Sign In Docs](https://react-native-google-signin.github.io/docs/one-tap)
- [Better Auth Social Sign In](https://www.better-auth.com/docs/authentication/social)
- [Google Identity Platform](https://developers.google.com/identity)

