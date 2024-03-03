import * as IconsOutline from 'react-native-heroicons/outline';
import * as IconsSolid from 'react-native-heroicons/solid';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Header from '@components/Header';

import Location from '@screens/LocationScreen';
import MakePayment from '@screens/MakePayment';
import Profile from '@screens/profile/Profile';
import Wallet from '@screens/wallet/Wallet';

export type TabNavParamList = {
  Wallet: undefined;
  MakePayment: undefined;
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
        name="MakePayment"
        component={MakePayment}
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
