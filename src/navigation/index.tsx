import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';

import CreateAccount from '@screens/welcome/CreateAccount';
import Home from '@screens/welcome/Home';
import Login from '@screens/welcome/Login';
import { Welcome } from '@screens/welcome/Welcome';

type RootStackParamList = {
  Welcome: undefined;
  SignUp: undefined;
  LogIn: undefined;
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { getItem } = useAsyncStorage('authToken');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      const token = await getItem();
      if (token) setIsLoggedIn(true);
    };
    checkAuthentication();
  }, []);

  return (
    <Stack.Navigator initialRouteName="Welcome">
      <Stack.Screen name="Welcome" component={Welcome} options={{ headerShown: false }} />
      <Stack.Screen name="SignUp" component={CreateAccount} options={{ headerShown: false }} />
      <Stack.Screen name="LogIn" component={Login} options={{ headerShown: false }} />
      {isLoggedIn ? <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} /> : null}
    </Stack.Navigator>
  );
}
