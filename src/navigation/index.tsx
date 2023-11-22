import { createNativeStackNavigator } from '@react-navigation/native-stack';

import BottomTabNavigator from './BottomTabNavigator';

import ConfirmPayment from '@screens/ConfirmPayment';
import Operation from '@screens/operation/Operation';
import ConfirmAccount from '@screens/welcome/ConfirmAccount';
import CreateAccount from '@screens/welcome/CreateAccount';
import Login from '@screens/welcome/Login';
import { Welcome } from '@screens/welcome/Welcome';

type RootStackParamList = {
  Welcome: undefined;
  SignUp: undefined;
  Login: undefined;
  Root: undefined;
  ConfirmPayment: undefined;
  Wallet: undefined;
  ConfirmAccount: undefined;
  Operation: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Welcome">
      <Stack.Screen name="Root" component={BottomTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="ConfirmPayment" component={ConfirmPayment} options={{ headerShown: false }} />
      <Stack.Screen name="Welcome" component={Welcome} options={{ headerShown: false }} />
      <Stack.Screen name="SignUp" component={CreateAccount} options={{ headerTitle: 'Sign Up' }} />
      <Stack.Screen name="Login" component={Login} options={{ headerTitle: 'Log In' }} />
      <Stack.Screen name="ConfirmAccount" component={ConfirmAccount} options={{ headerTitle: 'Confirm Account' }} />
      <Stack.Screen name="Operation" component={Operation} />
    </Stack.Navigator>
  );
}

export default RootNavigator;
