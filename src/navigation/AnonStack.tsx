import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from '@screens/Login';
import { Welcome } from '@screens/Welcome';
import ConfirmAccount from '@screens/signup/ConfirmAccount';
import CreateAccount from '@screens/signup/CreateAccount';

export type AnonStackParamList = {
  Welcome: undefined;
  SignUp: undefined;
  Login: undefined;
  ConfirmAccount: {
    email: string;
    username: string;
  };
};

const Stack = createNativeStackNavigator<AnonStackParamList>();

export function AnonStack() {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerTintColor: 'red',
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen name="Welcome" component={Welcome} options={{ headerShown: false }} />
      <Stack.Screen name="SignUp" component={CreateAccount} options={{ title: 'Sign up' }} />
      <Stack.Screen name="Login" component={Login} options={{ title: 'Sign in' }} />
      <Stack.Screen name="ConfirmAccount" component={ConfirmAccount} options={{ title: 'Confirm Account' }} />
    </Stack.Navigator>
  );
}
