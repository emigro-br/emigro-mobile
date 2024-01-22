import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { styled } from 'nativewind';
import { View } from 'react-native';
import * as IconsOutline from 'react-native-heroicons/outline';
import * as IconsSolid from 'react-native-heroicons/solid';

import Header from '@components/Header';

import Location from '@screens/Location';
import MakePayment from '@screens/MakePayment';
import Profile from '@screens/Profile';
import Wallet from '@screens/wallet/Wallet';

export type TabNavParamList = {
  Wallet: undefined;
  MakePayment: undefined;
  Location: undefined;
  Profile: undefined;
};


const BottomTab = createBottomTabNavigator<TabNavParamList>();
const enableLocation = false;

const StyledView = styled(View);

const BottomTabNavigator = () => {
  return (
    <BottomTab.Navigator
      initialRouteName="Wallet"
      screenOptions={{
        tabBarActiveTintColor: 'red',
        tabBarInactiveTintColor: 'grey',
      }}
    >
      <BottomTab.Screen
        name="Wallet"
        component={Wallet}
        options={() => ({
          title: 'Wallet',
          tabBarIcon: ({ focused }) =>
            focused ? (
              <StyledView className="h-full border-t-2 border-red w-full justify-center items-center">
                <StyledView className="mt-1">
                  <IconsSolid.WalletIcon size={24} color="red" />
                </StyledView>
              </StyledView>
            ) : (
              <StyledView className="mt-1">
                <IconsOutline.WalletIcon size={24} color="grey" />
              </StyledView>
            ),
          header: () => <Header />,
        })}
      />

      <BottomTab.Screen
        name="MakePayment"
        component={MakePayment}
        options={() => ({
          title: 'Payment',
          tabBarIcon: ({ focused }) =>
            focused ? (
              <StyledView className="h-full border-t-2 border-red w-full justify-center items-center">
                <StyledView className="mt-1">
                  <IconsSolid.QrCodeIcon size={24} color="red" />
                </StyledView>
              </StyledView>
            ) : (
              <StyledView className="mt-1">
                <IconsOutline.QrCodeIcon size={24} color="grey" />
              </StyledView>
            ),
          header: () => <Header />,
        })}
      />
      {enableLocation && (
        <BottomTab.Screen
        name="Location"
        component={Location}
        options={() => ({
          title: 'Location',
          tabBarIcon: ({ focused }) =>
          focused ? (
            <StyledView className="h-full border-t-2 border-red w-full justify-center items-center">
                <StyledView className="mt-1">
                  <IconsSolid.MapIcon size={24} color="red" />
                </StyledView>
              </StyledView>
            ) : (
              <StyledView className="mt-1">
                <IconsOutline.MapIcon size={24} color="grey" />
              </StyledView>
            ),
            header: () => <Header />,
          })}
          />
      )}
      <BottomTab.Screen
        name="Profile"
        component={Profile}
        options={() => ({
          title: 'Profile',
          tabBarIcon: ({ focused }) =>
            focused ? (
              <StyledView className="h-full border-t-2 border-red w-full justify-center items-center">
                <StyledView className="mt-1">
                  <IconsSolid.UserCircleIcon size={24} color="red" />
                </StyledView>
              </StyledView>
            ) : (
              <StyledView className="mt-1">
                <IconsOutline.UserCircleIcon size={24} color="grey" />
              </StyledView>
            ),
          header: () => <Header />,
        })}
      />
    </BottomTab.Navigator>
  );
};

export default BottomTabNavigator;
