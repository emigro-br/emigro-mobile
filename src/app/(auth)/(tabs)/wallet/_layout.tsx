import { Stack } from 'expo-router';

import Header from '@/components/Header';
import screenOptions from '@/navigation/screenOptions';

export const unstable_settings = {
  // Ensure any route can link back to `/`
  initialRouteName: 'index',
};

export default function WalletLayout() {
  return (
    <Stack
      screenOptions={{
        ...screenOptions,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Wallet', header: () => <Header /> }} />
      <Stack.Screen name="deposit" options={{ title: 'Deposit' }} />
      <Stack.Screen name="withdraw" options={{ title: 'Withdraw' }} />
      <Stack.Screen name="swap" options={{ title: 'Swap' }} />
      <Stack.Screen name="transfers" options={{ title: 'Transfers' }} />
      <Stack.Screen name="manage" options={{ title: 'Accounts' }} />
    </Stack>
  );
}
