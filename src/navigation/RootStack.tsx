import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from '@screens/Login';
import { Welcome } from '@screens/Welcome';
import ConfirmAccount from '@screens/signup/ConfirmAccount';
import CreateAccount from '@screens/signup/CreateAccount';

import MainApp from './MainApp';

export type RootStackParamList = {
  Welcome: undefined;
  SignUp: undefined;
  Login: undefined;
  Root: undefined;
  ConfirmAccount: {
    email: string;
    username: string;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

type Props = {
  isSignedIn: boolean;
};

function RootStack({ isSignedIn }: Props) {
  // TODO: improve the navigation with https://reactnavigation.org/docs/auth-flow/
  return (
    <Stack.Navigator
      initialRouteName={isSignedIn ? 'Root' : 'Welcome'}
      screenOptions={{
        headerShown: false,
        headerTintColor: 'red',
        headerBackTitleVisible: false,
      }}
    >
      {isSignedIn ? (
        <Stack.Screen name="Root" component={MainApp} />
      ) : (
        <>
          <Stack.Screen name="Welcome" component={Welcome} options={{ headerShown: false }} />
          {/* Auth screens */}
          <Stack.Group>
            <Stack.Screen name="SignUp" component={CreateAccount} options={{ title: 'Sign up' }} />
            <Stack.Screen name="Login" component={Login} options={{ title: 'Sign in' }} />
            <Stack.Screen name="ConfirmAccount" component={ConfirmAccount} options={{ title: 'Confirm Account' }} />
          </Stack.Group>
        </>
      )}
    </Stack.Navigator>
  );
}

export default RootStack;
