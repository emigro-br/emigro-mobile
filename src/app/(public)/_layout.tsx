import { Stack } from 'expo-router';

import screenOptions from '@/navigation/screenOptions';

export const unstable_settings = {
  initialRouteName: 'welcome',
};

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        ...screenOptions,
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ title: 'Sign in' }} />
      <Stack.Screen name="signup" options={{ title: 'Sign up' }} />
      {/* <Stack.Screen name="signup/confirm-account" options={{ title: 'Confirm Account' }} /> */}
      <Stack.Screen name="password-recovery" options={{ title: 'Password Recovery' }} />
      <Stack.Screen name="create-password" options={{ title: 'Create New Password' }} />
    </Stack>
  );
}
