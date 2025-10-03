import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Icon, Label, NativeTabs, VectorIcon } from 'expo-router/unstable-native-tabs';
import { DynamicColorIOS, Platform } from 'react-native';

export default function TabLayout() {
  // Only create dynamic colors on iOS to avoid Android errors
  const iosLabelStyle = Platform.OS === 'ios' ? {
    color: DynamicColorIOS({
      dark: 'white',
      light: 'black',
    }),
    tintColor: DynamicColorIOS({
      dark: 'white',
      light: 'black',
    }),
  } : undefined;

  return (
    <NativeTabs
      // Support for FlatList scroll-to-top behavior
      disableTransparentOnScrollEdge
      // Dynamic color support for iOS liquid glass effect
      labelStyle={iosLabelStyle}
    >
      <NativeTabs.Trigger name="index">
        <Label>Home</Label>
        {Platform.select({
          ios: <Icon sf={{ default: 'house', selected: 'house.fill' }} />,
          android: (
            <Icon
              src={<VectorIcon family={FontAwesome} name="home" />}
            />
          ),
        })}
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Label>Profile</Label>
        {Platform.select({
          ios: <Icon sf={{ default: 'person.circle', selected: 'person.circle.fill' }} />,
          android: (
            <Icon
              src={<VectorIcon family={FontAwesome} name="user-circle" />}
            />
          ),
        })}
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
