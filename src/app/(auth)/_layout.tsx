import { useEffect } from 'react';

import { Redirect, Stack, useRouter } from 'expo-router';
import { observer } from 'mobx-react-lite';

import { SplashScreen } from '@/components/Splash';
import { useSession } from '@/hooks/useSession';
import defaultScreenOptions from '@/navigation/screenOptions';
import { securityStore } from '@/stores/SecurityStore';
import { sessionStore } from '@/stores/SessionStore';

export function AppLayout() {
  const router = useRouter();
  const { session, isLoading } = useSession();

  const isLogged = session && !isLoading;
  useEffect(() => {
    if (isLogged) {
      const hasCurrencyChoosen = (sessionStore.preferences?.fiatsWithBank || []).length > 0;
      if (!hasCurrencyChoosen) {
        router.replace('/onboarding/choose-bank-currency');
        return;
      }

      const hasPin = securityStore.pin;
      if (hasPin) {
        if (!__DEV__) {
          router.replace('/unlock');
        }
      } else {
        router.replace('/onboarding/pin');
      }
    }
  }, [isLogged, securityStore.pin]);

  if (isLoading) {
    // We haven't finished checking for the token yet
    return <SplashScreen />;
  }

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!session) {
    return <Redirect href="/welcome" />;
  }

  return (
    <Stack initialRouteName="(tabs)" screenOptions={{ ...defaultScreenOptions }}>
      <Stack.Screen name="(tabs)" options={{ title: 'Wallet', headerShown: false }} />
      <Stack.Screen
        name="ramp/[kind]/[currency]/confirm/index"
        options={{ presentation: 'modal', headerShown: false }}
      />
      <Stack.Screen name="ramp/[kind]/[currency]/webview" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="payments/confirm/index" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen
        name="payments/request/show-qr-code"
        options={{ presentation: 'modal', headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen name="transfers/confirm" options={{ presentation: 'modal', headerShown: false }} />
    </Stack>
  );
}

export default observer(AppLayout);
