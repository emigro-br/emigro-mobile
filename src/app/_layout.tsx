import { useEffect, useState } from 'react';
import * as Sentry from '@sentry/react-native';
import { isRunningInExpoGo } from 'expo';
import { Slot, SplashScreen, useNavigationContainerRef } from 'expo-router';
import * as Updates from 'expo-updates';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';

SplashScreen.preventAutoHideAsync();

const routingInstrumentation = new Sentry.ReactNavigationInstrumentation();

async function onFetchUpdateAsync() {
  try {
    const update = await Updates.checkForUpdateAsync();
    if (update.isAvailable) {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    }
  } catch (error) {
    console.warn(`Error fetching latest Expo update: ${error}`);
  }
}

const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: __DEV__ ? 'development' : 'production',
    sampleRate: 1.0,
    tracesSampleRate: 0.5,
    integrations: [
      new Sentry.ReactNativeTracing({
        routingInstrumentation,
        enableNativeFramesTracking: !isRunningInExpoGo(),
      }),
    ],
  });
}

// ✅ Default export — this is what fixes the routing error!
export default function Layout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const ref = useNavigationContainerRef();

  useEffect(() => {
    routingInstrumentation.registerNavigationContainer(ref);
  }, [ref]);

  useEffect(() => {
    async function prepare() {
      if (!__DEV__) {
        await onFetchUpdateAsync();
      }
      await SplashScreen.hideAsync();
      setAppIsReady(true);
    }

    prepare();
  }, []);

  if (!appIsReady) return null;

  return (
    <GluestackUIProvider mode="light">
      <Slot />
    </GluestackUIProvider>
  );
}
