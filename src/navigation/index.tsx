import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';

import { BottomTabNavigator } from './BottomTabNavigator';

import ConfirmPayment from '@screens/ConfirmPayment';
import CreateAccount from '@screens/welcome/CreateAccount';
import Login from '@screens/welcome/Login';
import { Welcome } from '@screens/welcome/Welcome';

type RootStackParamList = {
  Welcome: undefined;
  SignUp: undefined;
  LogIn: undefined;
  Root: undefined;
  ConfirmPayment: undefined;
  Wallet: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { getItem } = useAsyncStorage('authToken');
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      const token = await getItem();
      if (token) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    };
    checkAuthentication();
  }, []);

  return (
    <Stack.Navigator initialRouteName={isLoggedIn ? 'Root' : 'Welcome'}>
      <Stack.Screen name="Welcome" component={Welcome} options={{ headerShown: false }} />
      <Stack.Screen name="Root" component={BottomTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="SignUp" component={CreateAccount} options={{ headerTitle: 'Sign Up' }} />
      <Stack.Screen name="LogIn" component={Login} options={{ headerTitle: 'Log In' }} />
      <Stack.Screen name="ConfirmPayment" component={ConfirmPayment} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
