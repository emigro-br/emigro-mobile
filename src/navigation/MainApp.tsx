import * as IconsOutline from 'react-native-heroicons/outline';
import * as IconsSolid from 'react-native-heroicons/solid';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Location from '@screens/Location';

import { PaymentStack } from './PaymentsStack';
import { ProfileStack } from './ProfileStack';
import { WalletStack } from './WalletStack';

export type TabNavParamList = {
  WalletTab: undefined;
  PaymentsTab: undefined;
  LocationTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<TabNavParamList>();
const enableLocation = false;

const MainApp = () => {
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
        options={() => ({
          title: 'Payment',
          tabBarIcon: ({ color, size }) => <IconsOutline.QrCodeIcon size={size} color={color} />,
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

export default MainApp;
