import { NavigatorScreenParams } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Header from '@components/Header';

import Deposit from '@screens/Deposit';
import Wallet from '@screens/Wallet';
import Withdraw from '@screens/Withdraw';

import { SwapStack, SwapStackParamList } from './SwapStack';
import { TransferStack, TransferStackParamList } from './TrasnsferStack';
import screenOptions from './screenOptions';

export type WalletStackParamList = {
  Wallet: undefined;
  Deposit: undefined;
  Withdraw: undefined;
  TransfersRoot: NavigatorScreenParams<TransferStackParamList> | undefined;
  SwapRoot: NavigatorScreenParams<SwapStackParamList> | undefined;
};

const Stack = createNativeStackNavigator<WalletStackParamList>();

export function WalletStack() {
  return (
    <Stack.Navigator initialRouteName="Wallet" screenOptions={screenOptions}>
      <Stack.Screen name="Wallet" component={Wallet} options={{ title: 'Wallet', header: () => <Header /> }} />
      <Stack.Screen name="Deposit" component={Deposit} options={{ title: 'Deposit' }} />
      <Stack.Screen name="Withdraw" component={Withdraw} options={{ title: 'Withdraw' }} />
      <Stack.Screen name="TransfersRoot" component={TransferStack} options={{ title: 'Transfers' }} />
      <Stack.Screen name="SwapRoot" component={SwapStack} options={{ title: 'Swap' }} />
    </Stack.Navigator>
  );
}
