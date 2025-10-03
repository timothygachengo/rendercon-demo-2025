# Passkey Setup for Android

This guide explains how to set up passkey authentication (biometric login) for Android.

## Overview

The app uses the `expo-passkey` library to implement WebAuthn-based passkey authentication with biometric verification on Android devices.

## Prerequisites

1. Android device with Android 10+ (API level 29+)
2. Biometric hardware (fingerprint or face recognition)
3. Backend server with HTTPS enabled

## Configuration Steps

### 1. Get Android SHA-256 Fingerprint

For **debug builds**, get the SHA-256 fingerprint:

```bash
keytool -list -v -keystore android/app/debug.keystore \
  -alias androiddebugkey \
  -storepass android \
  -keypass android | grep "SHA256:"
```

For **production builds**, use your release keystore:

```bash
keytool -list -v -keystore path/to/your/release.keystore \
  -alias your-key-alias \
  -storepass your-store-password \
  -keypass your-key-password | grep "SHA256:"
```

Example output:
```
SHA256: XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX
```

### 2. Convert SHA-256 to Base64 Format

The backend requires the SHA-256 hash in base64 format (android:apk-key-hash).

You can use this command to convert:

```bash
# Remove colons and convert hex to base64
echo "XX:XX:XX:XX:XX:XX:XX:XX..." | tr -d ':' | xxd -r -p | openssl base64
```

This will output something like: `--fSTrw19MLvyJ1myCJjnc7kbclf_b_dB4raOx2onUU`

### 3. Configure Backend

Update your backend auth configuration in `backend/src/lib/auth.ts`:

```typescript
expoPasskey({
  rpId: "your-domain.com",  // Your domain (without https://)
  rpName: "Your App Name",
  origin: [
    "https://your-domain.com",  // Your website
    "android:apk-key-hash:YOUR_BASE64_HASH_HERE"  // Android app signature
  ],
  // ... other config
})
```

### 4. Create Android Asset Links File

Create `.well-known/assetlinks.json` on your backend server:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls", "delegate_permission/common.get_login_creds"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.timothymugo.rendercondemo2025",
    "sha256_cert_fingerprints": [
      "XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX"
    ]
  }
}]
```

Make sure this file is accessible at:
```
https://your-domain.com/.well-known/assetlinks.json
```

**Important**: The file must:
- Be served over HTTPS
- Have `Content-Type: application/json`
- Be publicly accessible (no authentication required)

### 5. Update App Configuration

The `app.json` has been configured with intent filters for Android App Links.

### 6. Test the Configuration

1. Build and install the app:
   ```bash
   npm run android
   ```

2. Verify asset links:
   ```bash
   # Check if asset links file is accessible
   curl https://your-domain.com/.well-known/assetlinks.json
   ```

3. Test on device:
   - Sign up for a new account
   - When prompted, enable biometric login
   - Sign out and try signing in with biometric

## Features Implemented

1. **Sign-in with Passkey**: Users can authenticate using Face ID/Touch ID
2. **Passkey Registration**: Prompts new users to set up biometric login after sign-up
3. **Passkey Management**: Users can add/remove passkeys from their profile
4. **Platform Detection**: Automatically detects if device supports passkeys

## Troubleshooting

### Passkey not working

1. **Check biometric setup**: Ensure fingerprint/face recognition is set up on device
2. **Verify asset links**: Make sure `.well-known/assetlinks.json` is accessible
3. **Check SHA-256**: Verify the fingerprint in asset links matches your keystore
4. **Clear app data**: Uninstall and reinstall the app

### "Passkey not supported" message

- Device must be Android 10+ (API level 29+)
- Biometric hardware must be available
- Check `isPasskeySupported()` return value

### Authentication fails

1. Check backend logs for errors
2. Verify the `origin` configuration in backend matches your domain
3. Ensure the `rpId` matches your domain (without protocol)

## Security Notes

- Passkeys are stored securely in the device's secure enclave
- Each passkey is unique per device
- Users can have multiple passkeys (e.g., phone and tablet)
- Biometric data never leaves the device
- The server only stores public keys

## References

- [expo-passkey Documentation](https://github.com/iosazee/expo-passkey)
- [WebAuthn Specification](https://www.w3.org/TR/webauthn/)
- [Android App Links](https://developer.android.com/training/app-links)
- [Better Auth Passkey Plugin](https://www.better-auth.com/docs/plugins/passkey)

