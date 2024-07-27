import * as IconsOutline from 'react-native-heroicons/outline';
import * as IconsSolid from 'react-native-heroicons/solid';

import { Tabs } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'wallet',
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FF033E',
        tabBarInactiveTintColor: 'grey',
      }}
    >
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color, size }) => <IconsSolid.WalletIcon size={size} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          title: 'Payments',
          tabBarIcon: ({ color, size }) => <IconsOutline.QrCodeIcon size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <IconsOutline.UserCircleIcon size={size} color={color} />,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
