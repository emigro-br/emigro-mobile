import * as IconsOutline from 'react-native-heroicons/outline';
import * as IconsSolid from 'react-native-heroicons/solid';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Header from '@components/Header';

import Location from '@screens/Location';
import Wallet from '@screens/Wallet';
import Payments from '@screens/payments/Payments';
import Profile from '@screens/profile/Profile';

export type TabNavParamList = {
  Wallet: undefined;
  Payments: undefined;
  Location: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabNavParamList>();
const enableLocation = false;

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Wallet"
      screenOptions={{
        tabBarActiveTintColor: 'red',
        tabBarInactiveTintColor: 'grey',
      }}
    >
      <Tab.Screen
        name="Wallet"
        component={Wallet}
        options={() => ({
          title: 'Wallet',
          tabBarIcon: ({ color, size, focused }) => <IconsSolid.WalletIcon size={size} color={color} />,
          header: () => <Header />,
        })}
      />

      <Tab.Screen
        name="Payments"
        component={Payments}
        options={() => ({
          title: 'Payment',
          tabBarIcon: ({ color, size }) => <IconsOutline.QrCodeIcon size={size} color={color} />,
          header: () => <Header />,
        })}
      />

      {enableLocation && (
        <Tab.Screen
          name="Location"
          component={Location}
          options={() => ({
            title: 'Location',
            tabBarIcon: ({ size, color, focused }) => <IconsSolid.MapIcon size={size} color={color} />,
            header: () => <Header />,
          })}
        />
      )}

      <Tab.Screen
        name="Profile"
        component={Profile}
        options={() => ({
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => <IconsOutline.UserCircleIcon size={size} color={color} />,
          header: () => <Header />,
        })}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
