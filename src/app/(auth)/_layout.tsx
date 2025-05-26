import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';

import { Redirect, Stack, useRouter } from 'expo-router';
import { observer } from 'mobx-react-lite';

import { useSession } from '@/hooks/useSession';
import defaultScreenOptions from '@/navigation/screenOptions';
import { SplashScreen } from '@/screens/Splash';
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
      if (!hasPin) {
        router.replace('/onboarding/pin');
      } else {
		  
		  console.log('[AppLayout] 🔓 Locking logic is DISABLED for testing.');
		  
        // disable lock in development
        //if (__DEV__) {
        //  return;
        //}

        // lock when app is loaded
        //router.replace('/unlock');

        // lock when app is in background
        //const handleAppStateChange = (nextAppState: AppStateStatus) => {
        //  if (nextAppState === 'background' || nextAppState === 'inactive') {
        //    router.replace('/lock');
        //  } else if (nextAppState === 'active') {
        //    router.replace('/unlock');
        //  }
        //};

        // Subscribe to app state changes
        //const subscription = AppState.addEventListener('change', handleAppStateChange);
        //return () => {
        //  subscription.remove();
        //};
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
	<Stack
	  initialRouteName="(tabs)"
	  screenOptions={{
	    ...defaultScreenOptions,
	    headerStyle: {
	      backgroundColor: '#111', // change header background
	    },
	    headerTitleStyle: {
	      color: '#ccc',            // change title color
	      fontSize: 18,
	      fontWeight: 'bold',
	    },
	    headerTintColor: '#FF033E', // affects back button/icon tint
	  }}
	>
      <Stack.Screen name="(tabs)" options={{ title: '', headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />

      {/* Stop using presentaion modal for while (Android safe area) */}
      <Stack.Screen
        name="ramp/[kind]/[currency]/confirm"
        options={{ animation: 'slide_from_bottom', headerShown: false }}
      />
      <Stack.Screen
        name="ramp/[kind]/[currency]/webview"
        options={{ animation: 'slide_from_bottom', headerShown: false }}
      />
      <Stack.Screen
        name="payments/scan"
        options={{ animation: 'slide_from_bottom', headerShown: false, animationDuration: 200 }}
      />
      <Stack.Screen
        name="payments/request/show-qr-code"
        options={{ animation: 'slide_from_bottom', headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen name="payments/confirm" options={{ animation: 'slide_from_bottom', headerShown: false }} />
      <Stack.Screen name="transfers/confirm" options={{ animation: 'slide_from_bottom', headerShown: false }} />
    </Stack>
  );
}

export default observer(AppLayout);
