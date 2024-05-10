import { NavigatorScreenParams } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Wallet from '@/app/wallet';
import Deposit from '@/app/wallet/deposit';
import { ManageAccountsScreen } from '@/app/wallet/manage';
import Withdraw from '@/app/wallet/withdraw';

import Header from '@components/Header';

import { SwapStack, SwapStackParamList } from './SwapStack';
import { TransferStack, TransferStackParamList } from './TrasnsferStack';
import screenOptions from './screenOptions';

export type WalletStackParamList = {
  Wallet: undefined;
  Deposit: undefined;
  Withdraw: undefined;
  TransfersRoot: NavigatorScreenParams<TransferStackParamList> | undefined;
  SwapRoot: NavigatorScreenParams<SwapStackParamList> | undefined;
  ManageAccounts: undefined;
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
      <Stack.Screen name="ManageAccounts" component={ManageAccountsScreen} options={{ title: 'Accounts' }} />
    </Stack.Navigator>
  );
}
