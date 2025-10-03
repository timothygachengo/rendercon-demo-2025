import { useColorScheme } from '@/src/components/useColorScheme';
import Colors from '@/src/constants/Colors';
import { authClient, isPasskeySupported, listPasskeys, registerPasskey, revokePasskey } from '@/src/lib/auth-client';
import { handleGoogleSignOut } from '@/src/lib/google-signin';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
  token: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

interface Passkey {
  id: string;
  credentialId: string;
  platform: string;
  lastUsed: Date;
  createdAt: Date;
  status: string;
}

const Profile = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { data: session, isPending } = authClient.useSession();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isSessionsModalVisible, setIsSessionsModalVisible] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedImage, setEditedImage] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const [editedPhoneNumber, setEditedPhoneNumber] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [passkeySupported, setPasskeySupported] = useState(false);

  const user = session?.user;

  useEffect(() => {
    checkPasskeySupport();
    if (user) {
      loadPasskeys();
    }
  }, [user]);

  const checkPasskeySupport = async () => {
    try {
      const supported = await isPasskeySupported();
      setPasskeySupported(supported);
    } catch (error) {
      console.error('Error checking passkey support:', error);
      setPasskeySupported(false);
    }
  };

  const loadPasskeys = async () => {
    try {
      const result = await listPasskeys({ userId: user?.id || '' });
      if (result.error) {
        console.error('Failed to load passkeys:', result.error);
      } else {
        setPasskeys((result.data?.passkeys || []) as unknown as Passkey[]);
      }
    } catch (error) {
      console.error('Error loading passkeys:', error);
    }
  };

  const handleAddPasskey = async () => {
    if (!user) return;

    try {
      const result = await registerPasskey({
        userId: user.id,
        userName: user.email,
        rpId: 'https://owl-immune-hardly.ngrok-free.app',
        rpName: 'Rendercon Demo 2025',
        authenticatorSelection: {
          userVerification: 'required',
          residentKey: 'preferred',
        },
      });

      if (result.error) {
        Alert.alert('Failed to Add Passkey', result.error.message || 'Could not register passkey');
      } else {
        Alert.alert('Success', 'Passkey added successfully');
        loadPasskeys();
      }
    } catch (error) {
      console.error('Error adding passkey:', error);
      Alert.alert('Error', 'An error occurred while adding passkey');
    }
  };

  const handleRemovePasskey = async (credentialId: string) => {
    Alert.alert(
      'Remove Passkey',
      'Are you sure you want to remove this passkey?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await revokePasskey({
                userId: user?.id || '',
                credentialId
              });
              if (result.error) {
                Alert.alert('Failed to Remove', result.error.message || 'Could not remove passkey');
              } else {
                Alert.alert('Success', 'Passkey removed successfully');
                loadPasskeys();
              }
            } catch (error) {
              console.error('Error removing passkey:', error);
              Alert.alert('Error', 'An error occurred while removing passkey');
            }
          },
        },
      ]
    );
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Refresh user session data
    authClient.useSession();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleEditProfile = () => {
    setEditedName(user?.name || '');
    setEditedImage(user?.image || '');
    setEditedEmail(user?.email || '');
    setEditedPhoneNumber(user?.phoneNumber || '');
    setIsEditModalVisible(true);
  };

  const handleUpdateProfile = async () => {
    try {
      setIsUpdating(true);
      let hasError = false;
      let successMessages: string[] = [];

      // Update name, image, and phone number together
      if (
        editedName !== user?.name ||
        editedImage !== user?.image ||
        editedPhoneNumber !== user?.phoneNumber
      ) {
        const updateData: any = {
          name: editedName,
          image: editedImage,
        };

        // Add phone number if changed
        if (editedPhoneNumber !== user?.phoneNumber) {
          updateData.phoneNumber = editedPhoneNumber;
        }

        const response = await authClient.updateUser(updateData);

        if (response.error) {
          hasError = true;
          Alert.alert('Error', 'Failed to update profile');
        } else {
          successMessages.push('Profile updated successfully');
        }
      }

      // Update email if changed (requires separate verification flow)
      if (editedEmail !== user?.email) {
        try {
          const emailResponse = await authClient.changeEmail({
            newEmail: editedEmail,
            callbackURL: '/(tabs)/profile',
          });

          if (emailResponse.error) {
            Alert.alert(
              'Email Change',
              'Failed to change email. Make sure the email is not already in use.'
            );
            hasError = true;
          } else {
            successMessages.push('Email verification sent to your current email');
          }
        } catch (emailError) {
          console.error('Change email error:', emailError);
          Alert.alert(
            'Email Change',
            'Email change requested. Please check your current email for verification.'
          );
        }
      }

      if (!hasError && successMessages.length > 0) {
        Alert.alert('Success', successMessages.join('. '));
        setIsEditModalVisible(false);
      } else if (successMessages.length === 0 && !hasError) {
        Alert.alert('Info', 'No changes were made');
        setIsEditModalVisible(false);
      }
    } catch (error) {
      console.error('Update profile error:', error);
      Alert.alert('Error', 'An error occurred while updating your profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleViewSessions = async () => {
    setIsSessionsModalVisible(true);
    setIsLoadingSessions(true);
    try {
      // Fetch all active sessions
      const response = await authClient.listSessions();
      if (response.data) {
        setSessions(response.data as Session[]);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
      Alert.alert('Error', 'Failed to load sessions');
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const handleRevokeSession = async (sessionToken: string) => {
    try {
      await authClient.revokeSession({ token: sessionToken });
      // Refresh sessions list
      const response = await authClient.listSessions();
      if (response.data) {
        setSessions(response.data as Session[]);
      }
      Alert.alert('Success', 'Session revoked successfully');
    } catch (error) {
      console.error('Error revoking session:', error);
      Alert.alert('Error', 'Failed to revoke session');
    }
  };

  const handleRevokeOtherSessions = async () => {
    Alert.alert(
      'Revoke Other Sessions',
      'Are you sure you want to sign out from all other devices?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            try {
              await authClient.revokeOtherSessions();
              const response = await authClient.listSessions();
              if (response.data) {
                setSessions(response.data as Session[]);
              }
              Alert.alert('Success', 'All other sessions have been revoked');
            } catch (error) {
              console.error('Error revoking sessions:', error);
              Alert.alert('Error', 'Failed to revoke other sessions');
            }
          },
        },
      ]
    );
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              // Sign out from Better Auth
              await authClient.signOut();
              // Sign out from Google
              await handleGoogleSignOut();
              // Navigate to login screen
              router.replace('/');
            } catch (error) {
              console.error('Sign out error:', error);
              Alert.alert('Error', 'An error occurred while signing out');
            }
          },
        },
      ]
    );
  };

  if (isPending) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>No user session found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* User Profile Header */}
      <View style={styles.profileHeader}>
        <Image
          source={{ uri: user.image || 'https://via.placeholder.com/100' }}
          style={styles.profileImage}
        />
        <Text style={[styles.userName, { color: colors.text }]}>{user.name || 'User'}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        {user.phoneNumber && (
          <Text style={styles.userPhone}>{user.phoneNumber}</Text>
        )}

        <TouchableOpacity
          style={[styles.editButton, { borderColor: colors.tint }]}
          onPress={handleEditProfile}
        >
          <Ionicons name="create-outline" size={18} color={colors.tint} />
          <Text style={[styles.editButtonText, { color: colors.tint }]}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        {/* User Details */}
        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#fff' }]}
          onPress={handleEditProfile}
        >
          <View style={styles.menuItemLeft}>
            <View style={[styles.iconContainer, { backgroundColor: '#007AFF20' }]}>
              <Ionicons name="person-outline" size={24} color="#007AFF" />
            </View>
            <Text style={[styles.menuItemText, { color: colors.text }]}>Account Details</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>

        {/* Sessions */}
        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#fff' }]}
          onPress={handleViewSessions}
        >
          <View style={styles.menuItemLeft}>
            <View style={[styles.iconContainer, { backgroundColor: '#34C75920' }]}>
              <Ionicons name="phone-portrait-outline" size={24} color="#34C759" />
            </View>
            <Text style={[styles.menuItemText, { color: colors.text }]}>Active Sessions</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>

        {/* Passkeys */}
        {passkeySupported && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Biometric Authentication</Text>

            <View style={[styles.menuItem, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#fff' }]}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#007AFF20' }]}>
                  <MaterialIcons name="fingerprint" size={24} color="#007AFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.menuItemText, { color: colors.text }]}>Passkeys</Text>
                  <Text style={[styles.menuItemSubtext, { color: colors.tabIconDefault }]}>
                    {passkeys.length} active {passkeys.length === 1 ? 'passkey' : 'passkeys'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddPasskey}
              >
                <Text style={styles.addButtonText}>+ Add</Text>
              </TouchableOpacity>
            </View>

            {passkeys.length > 0 && (
              <View style={[styles.passkeysList, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#fff' }]}>
                {passkeys.map((passkey, index) => (
                  <View
                    key={passkey.id}
                    style={[
                      styles.passkeyItem,
                      { borderBottomColor: colors.tabIconDefault },
                      index === passkeys.length - 1 && styles.lastPasskeyItem,
                    ]}
                  >
                    <View style={styles.passkeyInfo}>
                      <Text style={[styles.passkeyPlatform, { color: colors.text }]}>
                        {passkey.platform}
                      </Text>
                      <Text style={[styles.passkeyDate, { color: colors.tabIconDefault }]}>
                        Added {new Date(passkey.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemovePasskey(passkey.credentialId)}
                      style={styles.removeButton}
                    >
                      <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Language And Preferences */}
        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#fff' }]}
          onPress={() => Alert.alert('Coming Soon', 'Language and preferences settings')}
        >
          <View style={styles.menuItemLeft}>
            <View style={[styles.iconContainer, { backgroundColor: '#00C7BE20' }]}>
              <Ionicons name="globe-outline" size={24} color="#00C7BE" />
            </View>
            <Text style={[styles.menuItemText, { color: colors.text }]}>Language And Preferences</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>

        {/* Sign Out */}
        <TouchableOpacity
          style={[styles.menuItem, styles.signOutItem, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#fff' }]}
          onPress={handleSignOut}
        >
          <View style={styles.menuItemLeft}>
            <View style={[styles.iconContainer, { backgroundColor: '#FF453A20' }]}>
              <Ionicons name="log-out-outline" size={24} color="#FF453A" />
            </View>
            <Text style={[styles.menuItemText, styles.signOutText]}>Sign Out</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>
      </View>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#fff' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Name</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.tabIconDefault }]}
                value={editedName}
                onChangeText={setEditedName}
                placeholder="Enter your name"
                placeholderTextColor={colors.tabIconDefault}
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>Email</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.tabIconDefault }]}
                value={editedEmail}
                onChangeText={setEditedEmail}
                placeholder="Enter your email"
                placeholderTextColor={colors.tabIconDefault}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Text style={[styles.helperText, { color: colors.tabIconDefault }]}>
                Changing your email will require verification
              </Text>

              <Text style={[styles.inputLabel, { color: colors.text }]}>Phone Number</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.tabIconDefault }]}
                value={editedPhoneNumber}
                onChangeText={setEditedPhoneNumber}
                placeholder="Enter your phone number"
                placeholderTextColor={colors.tabIconDefault}
                keyboardType="phone-pad"
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>Profile Image URL</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.tabIconDefault }]}
                value={editedImage}
                onChangeText={setEditedImage}
                placeholder="Enter image URL"
                placeholderTextColor={colors.tabIconDefault}
                autoCapitalize="none"
              />

              {editedImage ? (
                <Image source={{ uri: editedImage }} style={styles.previewImage} />
              ) : null}

              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.tint }]}
                onPress={handleUpdateProfile}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Sessions Modal */}
      <Modal
        visible={isSessionsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsSessionsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#fff' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Active Sessions</Text>
              <TouchableOpacity onPress={() => setIsSessionsModalVisible(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {isLoadingSessions ? (
                <ActivityIndicator size="large" color={colors.tint} />
              ) : (
                <>
                  {sessions.length > 1 && (
                    <TouchableOpacity
                      style={[styles.revokeAllButton, { backgroundColor: '#FF453A20' }]}
                      onPress={handleRevokeOtherSessions}
                    >
                      <Text style={styles.revokeAllButtonText}>Sign Out From Other Devices</Text>
                    </TouchableOpacity>
                  )}

                  {sessions.length === 0 ? (
                    <Text style={[styles.noSessionsText, { color: colors.text }]}>
                      No active sessions found
                    </Text>
                  ) : (
                    sessions.map((session, index) => (
                      <View
                        key={session.id}
                        style={[
                          styles.sessionItem,
                          { borderBottomColor: colors.tabIconDefault }
                        ]}
                      >
                        <View style={styles.sessionInfo}>
                          <Ionicons name="phone-portrait" size={24} color={colors.tint} />
                          <View style={styles.sessionDetails}>
                            <Text style={[styles.sessionText, { color: colors.text }]}>
                              Session {index + 1}
                            </Text>
                            <Text style={styles.sessionDate}>
                              Created: {new Date(session.createdAt).toLocaleDateString()}
                            </Text>
                            {session.ipAddress && (
                              <Text style={styles.sessionDate}>IP: {session.ipAddress}</Text>
                            )}
                          </View>
                        </View>
                        {sessions.length > 1 && (
                          <TouchableOpacity
                            onPress={() => handleRevokeSession(session.token)}
                            style={styles.revokeButton}
                          >
                            <Text style={styles.revokeButtonText}>Revoke</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    ))
                  )}
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 120
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 16,
    opacity: 0.6,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 5,
  },
  userPhone: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 20,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  menuSection: {
    paddingHorizontal: 16,
    gap: 1,
    marginTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    width: '100%',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  signOutItem: {
    marginTop: 10,
  },
  signOutText: {
    color: '#FF453A',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: 16,
    alignSelf: 'center',
  },
  saveButton: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sessionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  sessionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  sessionDetails: {
    flex: 1,
  },
  sessionText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  revokeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#FF453A20',
  },
  revokeButtonText: {
    color: '#FF453A',
    fontSize: 14,
    fontWeight: '600',
  },
  revokeAllButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  revokeAllButtonText: {
    color: '#FF453A',
    fontSize: 16,
    fontWeight: '600',
  },
  noSessionsText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
  menuItemSubtext: {
    fontSize: 13,
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  passkeysList: {
    borderRadius: 12,
    marginTop: 8,
    paddingHorizontal: 16,
  },
  passkeyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  lastPasskeyItem: {
    borderBottomWidth: 0,
  },
  passkeyInfo: {
    flex: 1,
  },
  passkeyPlatform: {
    fontSize: 16,
    fontWeight: '500',
  },
  passkeyDate: {
    fontSize: 13,
    marginTop: 2,
  },
  removeButton: {
    backgroundColor: '#FF453A20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  removeButtonText: {
    color: '#FF453A',
    fontSize: 14,
    fontWeight: '600',
  },
});