import { Stack } from 'expo-router';

import screenOptions from '@/navigation/screenOptions';

export const unstable_settings = {
  // Ensure any route can link back to `/`
  initialRouteName: 'index',
};

export default function WalletLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        ...screenOptions,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Wallet' }} />
      <Stack.Screen name="manage" options={{ title: 'Accounts' }} />
    </Stack>
  );
}
