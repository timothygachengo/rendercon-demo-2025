import { GOOGLE_ICON_URL } from '@/src/constants';
import { Image } from 'expo-image';
import { ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from './Themed';

interface GoogleSignInButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  label?: string;
}

export function GoogleSignInButton({
  onPress,
  loading = false,
  disabled = false,
  label = 'Continue with Google',
}: GoogleSignInButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, (loading || disabled) && styles.buttonDisabled]}
      onPress={onPress}
      disabled={loading || disabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color="#000" style={styles.icon} />
      ) : (
        <Image
          source={{ uri: GOOGLE_ICON_URL }}
          style={styles.icon}
          contentFit="contain"
        />
      )}
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    gap: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  icon: {
    width: 24,
    height: 24,
  },
  text: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});

