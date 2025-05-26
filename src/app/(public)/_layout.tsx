import { Stack } from 'expo-router';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import config from '@/components/ui/gluestack-ui-provider/config';

export const unstable_settings = {
  initialRouteName: 'welcome',
};

export default function PublicLayout() {
  return (
    <GluestackUIProvider config={config} colorMode="dark">
      <Stack
        screenOptions={{
          headerBackTitleVisible: false,
          headerStyle: { backgroundColor: '#000' },
          headerTintColor: '#fff',
        }}
      >
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: 'Sign in' }} />
        <Stack.Screen name="signup" options={{ title: 'Sign up' }} />
        <Stack.Screen name="password-recovery" options={{ title: 'Password Recovery' }} />
        <Stack.Screen name="create-password" options={{ title: 'Create New Password' }} />
      </Stack>
    </GluestackUIProvider>
  );
}
