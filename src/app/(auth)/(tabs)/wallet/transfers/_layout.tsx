import { Stack } from 'expo-router';

import screenOptions from '@/navigation/screenOptions';

export default function Layout() {
  return (
    <Stack screenOptions={{ ...screenOptions, headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Transfers' }} />
      <Stack.Screen name="send" options={{ title: 'Transfer Info' }} />
      <Stack.Screen name="review" options={{ title: 'Review Transfer' }} />
    </Stack>
  );
}
