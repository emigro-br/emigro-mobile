import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { styled } from 'nativewind';
import { View } from 'react-native';
import * as IconsOutline from 'react-native-heroicons/outline';
import * as IconsSolid from 'react-native-heroicons/solid';

import MakePayment from '@screens/MakePayment';
import Wallet from '@screens/Wallet';

const BottomTab = createBottomTabNavigator<any>();

const StyledView = styled(View);

const BottomTabNavigator = () => {
  return (
    <BottomTab.Navigator
      initialRouteName="Wallet"
      screenOptions={{
        tabBarActiveTintColor: 'black',
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
              <StyledView className="h-full border-t-2 border-artic-500 w-full justify-center items-center">
                <StyledView className="mt-1">
                  <IconsSolid.WalletIcon size={24} color="black" />
                </StyledView>
              </StyledView>
            ) : (
              <StyledView className="mt-1">
                <IconsOutline.WalletIcon size={24} color="grey" />
              </StyledView>
            ),
          header: () => '',
        })}
      />
      <BottomTab.Screen
        name="MakePayment"
        component={MakePayment}
        options={() => ({
          title: 'MakePayment',
          tabBarIcon: ({ focused }) =>
            focused ? (
              <StyledView className="h-full border-t-2 border-artic-500 w-full justify-center items-center">
                <StyledView className="mt-1">
                  <IconsSolid.QrCodeIcon size={24} color="black" />
                </StyledView>
              </StyledView>
            ) : (
              <StyledView className="mt-1">
                <IconsOutline.QrCodeIcon size={24} color="grey" />
              </StyledView>
            ),
          header: () => '',
        })}
      />
    </BottomTab.Navigator>
  );
};

export default BottomTabNavigator;
