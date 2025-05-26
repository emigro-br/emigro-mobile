import { Stack } from 'expo-router';

import defaultScreenOptions from '@/navigation/screenOptions';

export default function Layout() {
  return (
    <Stack screenOptions={defaultScreenOptions}>
      <Stack.Screen name="index" options={{ title: 'Profile', headerShown: false }} />
      <Stack.Screen name="delete-account" options={{ title: 'Delete Account' }} />
    </Stack>
  );
}
