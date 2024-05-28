import { ViewStyle } from 'react-native';
import * as IconsOutline from 'react-native-heroicons/outline';
import * as IconsSolid from 'react-native-heroicons/solid';

import { Tabs, usePathname } from 'expo-router';

const getTabBarStyle = (path: string): ViewStyle => {
  // https://github.com/expo/router/issues/518
  // https://stackoverflow.com/questions/51352081/react-navigation-how-to-hide-tabbar-from-inside-stack-navigation#comment121635652_64789273
  const tabHiddenRoutes = ['/payments/scan', '/payments/request/show-qr-code'];
  if (tabHiddenRoutes.includes(path)) {
    return { display: 'none' };
  }
  return { display: 'flex' };
};

export const unstable_settings = {
  initialRouteName: 'wallet',
};

export default function TabLayout() {
  const path = usePathname();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF033E',
        tabBarInactiveTintColor: 'grey',
      }}
    >
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color, size }) => <IconsSolid.WalletIcon size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="payments"
        options={{
          title: 'Payments',
          tabBarIcon: ({ color, size }) => <IconsOutline.QrCodeIcon size={size} color={color} />,
          tabBarStyle: getTabBarStyle(path),
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
