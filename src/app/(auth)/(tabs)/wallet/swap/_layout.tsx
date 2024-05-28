import { Stack } from 'expo-router';

import defaultScreenOptions from '@/navigation/screenOptions';

export const unstable_settings = {
  // Ensure any route can link back to `/`
  initialRouteName: 'index',
};

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        ...defaultScreenOptions,
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Swap' }} />
      <Stack.Screen name="review" options={{ title: 'Review Swap' }} />
    </Stack>
  );
}
