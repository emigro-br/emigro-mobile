import * as IconsOutline from 'react-native-heroicons/outline';
import * as IconsSolid from 'react-native-heroicons/solid';

// import { Route, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Tabs } from 'expo-router';

// const getTabBarStyle = (route: Partial<Route<string>>): ViewStyle => {
//   // https://stackoverflow.com/questions/51352081/react-navigation-how-to-hide-tabbar-from-inside-stack-navigation#comment121635652_64789273
//   const tabHiddenRoutes = ['PayWithQRCode', 'RequestWithQRCode'];
//   const routeName = getFocusedRouteNameFromRoute(route) ?? 'WalletTab';
//   if (tabHiddenRoutes.includes(routeName)) {
//     return { display: 'none' };
//   }
//   return { display: 'flex' };
// };

export const unstable_settings = {
  initialRouteName: 'wallet',
};

export default function TabLayout() {
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
