import React, { useEffect, useState } from 'react';
import { LogBox } from 'react-native';
import * as Updates from 'expo-updates';
import { SplashScreen, Slot, useNavigationContainerRef } from 'expo-router';
import { isRunningInExpoGo } from 'expo';
import * as Sentry from '@sentry/react-native';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';

// Optional: Silence specific warnings
LogBox.ignoreLogs([
  '`new NativeEventEmitter()` was called with a non-null argument',
]);

// Prevent splash from auto-hiding until we're ready
SplashScreen.preventAutoHideAsync();

// Setup Sentry (guarded)
const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
const routingInstrumentation = new Sentry.ReactNavigationInstrumentation();

if (sentryDsn) {
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

function AppLayout() {
  const [isReady, setIsReady] = useState(false);
  const navRef = useNavigationContainerRef();

  useEffect(() => {
    routingInstrumentation.registerNavigationContainer(navRef);
  }, [navRef]);

  useEffect(() => {
    async function prepare() {
      try {
        if (!__DEV__) {
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
            await Updates.fetchUpdateAsync();
            await Updates.reloadAsync();
          }
        }
      } catch (err) {
        console.warn('[UPDATES] Failed to fetch updates', err);
      } finally {
        await SplashScreen.hideAsync();
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  if (!isReady) return null;

  return (
    <GluestackUIProvider mode="light">
      <Slot />
    </GluestackUIProvider>
  );
}

export default Sentry.wrap(AppLayout);
