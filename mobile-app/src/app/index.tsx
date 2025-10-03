import { Text, View } from '@/src/components/Themed';
import { router } from 'expo-router';
import { StyleSheet, TouchableOpacity } from 'react-native';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to{'\n'}RenderCon Demo</Text>
        <Text style={styles.subtitle}>
          Sign in to your account or create a new one to get started
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => router.push('/(auth)/sign-in')}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signUpButton}
            onPress={() => router.push('/(auth)/sign-up')}
          >
            <Text style={styles.signUpButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.guestButton}
          onPress={() => router.push('/(tabs)')}
        >
          <Text style={styles.guestButtonText}>Continue as Guest</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 48,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 60,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 16,
  },
  signInButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  signUpButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  signUpButtonText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: '600',
  },
  guestButton: {
    marginTop: 32,
    padding: 12,
  },
  guestButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  },
});

