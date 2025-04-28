import * as IconsOutline from 'react-native-heroicons/outline';
import * as IconsSolid from 'react-native-heroicons/solid';
import { Tabs } from 'expo-router';
import { useTheme } from '@/__utils__/ThemeProvider'; // Import your theme hook

export const unstable_settings = {
  initialRouteName: 'wallet',
};

export default function TabLayout() {
  const { theme } = useTheme(); // Read the current theme (light/dark)

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme === 'dark' ? '#1E1E1E' : '#FFFFFF', // Background dark/light
          borderTopWidth: 0,
          paddingTop: 4,
          paddingBottom: 4,
        },
        tabBarActiveTintColor: '#FF033E', // ← Always red, in both themes
        tabBarInactiveTintColor: theme === 'dark' ? '#AAAAAA' : 'grey', // Inactive is light gray (dark mode) or gray (light mode)
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color, size }) => (
            <IconsSolid.WalletIcon size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          title: 'Payments',
          tabBarIcon: ({ color, size }) => (
            <IconsOutline.QrCodeIcon size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <IconsOutline.UserCircleIcon size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
