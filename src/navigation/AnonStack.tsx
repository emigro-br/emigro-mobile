import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from '@/app/signin';
import { CreateNewPassword } from '@/app/signin/create-new-password';
import { PasswordRecovery } from '@/app/signin/password-recovery';
import { CreateAccount } from '@/app/signup';
import ConfirmAccount from '@/app/signup/confirm';
import { Welcome } from '@/app/welcome';

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
