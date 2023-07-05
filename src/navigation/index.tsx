import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';

import BottomTabNavigator from './BottomTabNavigator';

import CreateAccount from '@screens/welcome/CreateAccount';
import Login from '@screens/welcome/Login';
import { Welcome } from '@screens/welcome/Welcome';

type RootStackParamList = {
  Welcome: undefined;
  SignUp: undefined;
  LogIn: undefined;
  Root: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
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
    </Stack.Navigator>
  );
};

export default RootNavigator;
