import { ViewStyle } from 'react-native';
import * as IconsOutline from 'react-native-heroicons/outline';
import * as IconsSolid from 'react-native-heroicons/solid';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigatorScreenParams, Route, getFocusedRouteNameFromRoute } from '@react-navigation/native';

import Location from '@/app/location';

import { PaymentStack, PaymentStackParamList } from './PaymentsStack';
import { ProfileStack, ProfileStackParamList } from './ProfileStack';
import { WalletStack } from './WalletStack';

export type TabNavParamList = {
  WalletTab: undefined;
  PaymentsTab: NavigatorScreenParams<PaymentStackParamList> | undefined;
  LocationTab: undefined;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList> | undefined;
};

const Tab = createBottomTabNavigator<TabNavParamList>();
const enableLocation = false;

const getTabBarStyle = (route: Partial<Route<string>>): ViewStyle => {
  // https://stackoverflow.com/questions/51352081/react-navigation-how-to-hide-tabbar-from-inside-stack-navigation#comment121635652_64789273
  const tabHiddenRoutes = ['PayWithQRCode', 'RequestWithQRCode'];
  const routeName = getFocusedRouteNameFromRoute(route) ?? 'WalletTab';
  if (tabHiddenRoutes.includes(routeName)) {
    return { display: 'none' };
  }
  return { display: 'flex' };
};

export const MainApp = () => {
  return (
    <Tab.Navigator
      initialRouteName="WalletTab"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF033E',
        tabBarInactiveTintColor: 'grey',
      }}
    >
      <Tab.Screen
        name="WalletTab"
        component={WalletStack}
        options={() => ({
          title: 'Wallet',
          tabBarIcon: ({ color, size, focused }) => <IconsSolid.WalletIcon size={size} color={color} />,
        })}
      />

      <Tab.Screen
        name="PaymentsTab"
        component={PaymentStack}
        options={({ route }) => ({
          title: 'Payments',
          tabBarIcon: ({ color, size }) => <IconsOutline.QrCodeIcon size={size} color={color} />,
          tabBarStyle: getTabBarStyle(route),
        })}
      />

      {enableLocation && (
        <Tab.Screen
          name="LocationTab"
          component={Location}
          options={() => ({
            title: 'Location',
            tabBarIcon: ({ size, color, focused }) => <IconsSolid.MapIcon size={size} color={color} />,
          })}
        />
      )}

      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={() => ({
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => <IconsOutline.UserCircleIcon size={size} color={color} />,
        })}
      />
    </Tab.Navigator>
  );
};
