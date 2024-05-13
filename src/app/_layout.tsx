import { useEffect, useState } from 'react';

import { GluestackUIProvider } from '@gluestack-ui/themed';
import { Slot, SplashScreen } from 'expo-router';
// import { useColorScheme } from 'react-native';
import * as Updates from 'expo-updates';

import { config } from '@/config/gluestack-ui.config';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

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

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
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
