import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { Alert, Platform } from 'react-native';
import { authClient } from './auth-client';

// Configure Google Sign In
export const configureGoogleSignIn = () => {
  try {
    GoogleSignin.configure({
      webClientId: '646390625123-h5f1ig1drh9g9uvqrm077nqfptvpjfid.apps.googleusercontent.com', // Automatically detect from Firebase config
      offlineAccess: true,
      // iosClientId will be auto-detected from GoogleService-Info.plist
    });
  } catch (error) {
    console.error('Google Sign In configuration error:', error);
  }
};

// Handle Google Sign In flow
export const handleGoogleSignIn = async () => {
  try {
    // Check Play Services on Android
    if (Platform.OS === 'android') {
      await GoogleSignin.hasPlayServices();
    }

    // Check if user is already signed in
    const isSignedIn = GoogleSignin.hasPreviousSignIn();

    let userInfo;
    if (isSignedIn) {
      // Get current user
      userInfo = await GoogleSignin.signInSilently();
    } else {
      // Sign in with user interaction
      userInfo = await GoogleSignin.signIn();
    }

    if (userInfo && userInfo.data) {
      const { idToken } = userInfo.data;

      if (!idToken) {
        throw new Error('No ID token received from Google');
      }

      // Exchange Google token with Better Auth
      const authResult = await authClient.signIn.social({
        provider: 'google',
        idToken: {
            token: idToken,
        }
      });

      if (authResult.error) {
        throw new Error(authResult.error.message);
      }

      return { success: true, user: authResult.data };
    }

    return { success: false };
  } catch (error: any) {
    console.error('Google Sign In error:', error);

    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      return { success: false, cancelled: true };
    } else if (error.code === statusCodes.IN_PROGRESS) {
      Alert.alert('Sign In In Progress', 'Sign in is already in progress');
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      Alert.alert(
        'Google Play Services Required',
        'Please update Google Play Services to use Google Sign In.'
      );
    } else {
      Alert.alert('Error', error.message || 'An error occurred with Google Sign In');
    }

    return { success: false, error };
  }
};

// Sign out from Google
export const handleGoogleSignOut = async () => {
  try {
    await GoogleSignin.signOut();
    return { success: true };
  } catch (error) {
    console.error('Google Sign Out error:', error);
    return { success: false, error };
  }
};
