//import '@/i18n';
import React, { useEffect, useState } from 'react';
import { LogBox, View, Text } from 'react-native';
import * as Updates from 'expo-updates';
import { SplashScreen, Slot, useNavigationContainerRef } from 'expo-router';
import { isRunningInExpoGo } from 'expo';
import * as Sentry from '@sentry/react-native';

import { ThemeProvider } from '@/__utils__/ThemeProvider';
import '@/global.css';

// Ignore known harmless warning
LogBox.ignoreLogs([
  'new NativeEventEmitter() was called with a non-null argument',
]);

// Prevent splash screen from auto hiding
SplashScreen.preventAutoHideAsync().catch((e) => {
  console.warn('[SPLASH] Failed to prevent auto hide', e);
});

let routingInstrumentation: any;

try {
  const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

  if (Sentry && Sentry.ReactNavigationInstrumentation) {
    routingInstrumentation = new Sentry.ReactNavigationInstrumentation();
  } else {
    console.warn('[SENTRY] ReactNavigationInstrumentation is not available');
  }

  if (sentryDsn && Sentry) {
    console.log('[SENTRY] Initializing...');
    Sentry.init({
      dsn: sentryDsn,
      debug: __DEV__,
      environment: __DEV__ ? 'development' : 'production',
      tracesSampleRate: 1.0,
      integrations: [
        new Sentry.ReactNativeTracing({
          routingInstrumentation,
          enableNativeFramesTracking: !isRunningInExpoGo(),
        }),
      ],
    });
  }
} catch (e) {
  console.error('[SENTRY] Failed to initialize Sentry:', e);
}

function AppLayout() {
  const [isReady, setIsReady] = useState(false);
  const navRef = useNavigationContainerRef();

  useEffect(() => {
    try {
      if (routingInstrumentation && navRef) {
        console.log('[NAVIGATION] Registering navigation container');
        routingInstrumentation.registerNavigationContainer(navRef);
      }
    } catch (e) {
      console.error('[NAVIGATION] Failed to register container:', e);
    }
  }, [navRef]);

  useEffect(() => {
    async function prepare() {
      try {
        console.log('[UPDATES] Checking for updates...');
        if (!__DEV__) {
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
            console.log('[UPDATES] Update available. Fetching...');
            await Updates.fetchUpdateAsync();
            await Updates.reloadAsync();
          }
        }
      } catch (err) {
        console.warn('[UPDATES] Failed to check or apply update', err);
      } finally {
        try {
          console.log('[SPLASH] Hiding splash screen...');
          await SplashScreen.hideAsync();
        } catch (e) {
          console.warn('[SPLASH] Failed to hide splash screen', e);
        }
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  if (!isReady) {
    console.log('[RENDER] Still loading...');
    return (
      <View className="flex-1 bg-background-0 justify-center items-center">
        <Text style={{ color: 'gray' }}>Loading...</Text>
      </View>
    );
  }

  console.log('[RENDER] App is ready');

  return (
    <ThemeProvider>
      <Slot />
    </ThemeProvider>
  );
}

export default Sentry.wrap(AppLayout);
