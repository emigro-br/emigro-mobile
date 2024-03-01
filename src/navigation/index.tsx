import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ConfirmPayment from '@screens/ConfirmPayment';
import Deposit from '@screens/operation/Deposit';
import Withdraw from '@screens/operation/Withdraw';
import DeleteAccount from '@screens/profile/DeleteAccount';
import { DetailsSwap } from '@screens/swap/DetailsSwap';
import { Swap } from '@screens/swap/Swap';
import ReviewTransfer from '@screens/transfers/ReviewTransfer';
import SendAsset from '@screens/transfers/SendAsset';
import Transfers from '@screens/transfers/Transfers';
import ConfirmAccount from '@screens/welcome/ConfirmAccount';
import CreateAccount from '@screens/welcome/CreateAccount';
import Login from '@screens/welcome/Login';
import { Welcome } from '@screens/welcome/Welcome';

import BottomTabNavigator from './BottomTabNavigator';

export type RootStackParamList = {
  Welcome: undefined;
  SignUp: undefined;
  Login: undefined;
  Root: undefined;
  MakePayment: undefined;
  ConfirmPayment: undefined;
  Wallet: undefined;
  ConfirmAccount: {
    email: string;
    username: string;
  };
  Deposit: undefined;
  Withdraw: undefined;
  Swap: undefined;
  DetailsSwap: undefined;
  DeleteAccount: undefined;
  Transfers: undefined;
  ReviewTransfer: undefined;
  SendAsset: {
    asset: string;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

type Props = {
  isSignedIn: boolean;
};

function RootNavigator({ isSignedIn }: Props) {
  // TODO: improve the navigation with https://reactnavigation.org/docs/auth-flow/
  return (
    <Stack.Navigator
      initialRouteName={isSignedIn ? 'Root' : 'Welcome'}
      screenOptions={{
        headerTintColor: 'red',
      }}
    >
      {isSignedIn ? (
        <>
          <Stack.Screen name="Root" component={BottomTabNavigator} options={{ headerShown: false }} />

          {/* Transaction screens */}
          <Stack.Group>
            <Stack.Screen name="MakePayment" component={BottomTabNavigator} options={{ headerShown: false }} />
            <Stack.Screen
              name="ConfirmPayment"
              component={ConfirmPayment}
              options={{ headerTitle: 'Confirm Payment' }}
            />
            <Stack.Screen
              name="Deposit"
              component={Deposit}
              options={{ headerBackTitle: 'Back', headerTitle: 'Deposit' }}
            />
            <Stack.Screen
              name="Withdraw"
              component={Withdraw}
              options={{ headerBackTitle: 'Back', headerTitle: 'Withdraw' }}
            />
            <Stack.Screen name="Transfers" component={Transfers} options={{ title: 'Transfers' }} />
            <Stack.Screen name="ReviewTransfer" component={ReviewTransfer} options={{ title: 'Review Transfer' }} />
            <Stack.Screen
              name="SendAsset"
              component={SendAsset}
              options={{ title: 'Transfers', headerTitle: '', headerBackTitleVisible: false }}
              initialParams={{ asset: '' }}
            />
            <Stack.Screen name="Swap" component={Swap} options={{ headerShown: true }} />
            <Stack.Screen name="DetailsSwap" component={DetailsSwap} options={{ headerTitle: 'Confirm Swap' }} />
          </Stack.Group>

          <Stack.Screen name="DeleteAccount" component={DeleteAccount} options={{ headerTitle: 'Delete Account' }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Welcome" component={Welcome} options={{ headerShown: false }} />
          {/* Auth screens */}
          <Stack.Group>
            <Stack.Screen name="SignUp" component={CreateAccount} options={{ headerTitle: 'Create Account' }} />
            <Stack.Screen
              name="Login"
              component={Login}
              options={{ headerTitle: 'Login', headerBackTitleVisible: false }}
            />
            <Stack.Screen
              name="ConfirmAccount"
              component={ConfirmAccount}
              options={{ headerTitle: 'Confirm Account' }}
            />
          </Stack.Group>
        </>
      )}
    </Stack.Navigator>
  );
}

export default RootNavigator;
