import { useEffect, useState } from 'react';

import { GluestackUIProvider } from '@gluestack-ui/themed';
import * as Sentry from '@sentry/react-native';
// import { useColorScheme } from 'react-native';
import { isRunningInExpoGo } from 'expo';
import { Slot, SplashScreen, useNavigationContainerRef } from 'expo-router';
import * as Updates from 'expo-updates';

import { config } from '@/config/gluestack-ui.config';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Construct a new instrumentation instance. This is needed to communicate between the integration and React
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
    debug: false, // __DEV__, // Enable debug in development mode
    environment: __DEV__ ? 'development' : 'production',
    sampleRate: 1.0, // Send 100% of events for while developing
    tracesSampleRate: 0.5,
    ignoreErrors: ['QueryFailedError'], // expo local development error
    integrations: [
      new Sentry.ReactNativeTracing({
        // Pass instrumentation to be used as `routingInstrumentation`
        routingInstrumentation,
        enableNativeFramesTracking: !isRunningInExpoGo(),
        // ...
      }),
    ],
  });
}

function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  // Capture the NavigationContainer ref and register it with the instrumentation.
  const ref = useNavigationContainerRef();

  useEffect(() => {
    if (ref) {
      routingInstrumentation.registerNavigationContainer(ref);
    }
  }, [ref]);

  // const [loaded, error] = useFonts({
  //   SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  //   ...FontAwesome.font,
  // });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  // useEffect(() => {
  //   if (error) throw error;
  // }, [error]);

  useEffect(() => {
    async function prepare() {
      try {
        // Load fonts, make API requests, etc.
        // await loadAsync({ SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf') });
        // await fetch('https://api.example.com/data');
        // await new Promise(resolve => setTimeout(resolve, 1000));

        if (!__DEV__) {
          await onFetchUpdateAsync();
        }

        await SplashScreen.hideAsync();
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  });

  if (!appIsReady) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  // const colorScheme = useColorScheme();

  return (
    <GluestackUIProvider config={config}>
      <Slot />
    </GluestackUIProvider>
  );
}

export default Sentry.wrap(RootLayout);
