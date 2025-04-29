import { View } from 'react-native';
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
          backgroundColor: theme === 'dark' ? '#1E1E1E' : '#FFFFFF',
          borderTopWidth: 0,
          paddingTop: 4,
          paddingBottom: 4,
          height: 65, // a little taller
        },
        tabBarActiveTintColor: '#f1496a',
        tabBarInactiveTintColor: theme === 'dark' ? '#AAAAAA' : 'grey',
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <View
                style={{
                  height: 4,
                  width: 40,
                  backgroundColor: focused ? '#f1496a' : 'transparent',
                  borderRadius: 2,
                  marginBottom: 4,
                }}
              />
              <IconsSolid.WalletIcon size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          title: 'Payments',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <View
                style={{
                  height: 4,
                  width: 40,
                  backgroundColor: focused ? '#f1496a' : 'transparent',
                  borderRadius: 2,
                  marginBottom: 4,
                }}
              />
              <IconsOutline.QrCodeIcon size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <View
                style={{
                  height: 4,
                  width: 40,
                  backgroundColor: focused ? '#f1496a' : 'transparent',
                  borderRadius: 2,
                  marginBottom: 4,
                }}
              />
              <IconsOutline.UserCircleIcon size={size} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
