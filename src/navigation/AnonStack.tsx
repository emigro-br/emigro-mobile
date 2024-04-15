import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CreateNewPassword } from '@screens/CreateNewPassword';
import Login from '@screens/Login';
import { PasswordRecovery } from '@screens/PasswordRecovery';
import { Welcome } from '@screens/Welcome';
import ConfirmAccount from '@screens/signup/ConfirmAccount';
import { CreateAccount } from '@screens/signup/CreateAccount';

import screenOptions from './screenOptions';

export type AnonStackParamList = {
  Welcome: undefined;
  SignUp: undefined;
  Login: undefined;
  ConfirmAccount: {
    email: string;
    username: string;
  };
  PasswordRecovery: undefined;
  CreateNewPassword: {
    email: string;
  };
};

const Stack = createNativeStackNavigator<AnonStackParamList>();

export function AnonStack() {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        ...screenOptions,
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen name="Welcome" component={Welcome} options={{ headerShown: false }} />
      <Stack.Screen name="SignUp" component={CreateAccount} options={{ title: 'Sign up' }} />
      <Stack.Screen name="Login" component={Login} options={{ title: 'Sign in' }} />
      <Stack.Screen name="ConfirmAccount" component={ConfirmAccount} options={{ title: 'Confirm Account' }} />
      <Stack.Screen name="PasswordRecovery" component={PasswordRecovery} options={{ title: 'Password Recovery' }} />
      <Stack.Screen name="CreateNewPassword" component={CreateNewPassword} options={{ title: 'Create New Password' }} />
    </Stack.Navigator>
  );
}
