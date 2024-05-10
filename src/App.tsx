import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { NavigationContainer } from '@react-navigation/native';

import { GluestackUIProvider } from '@gluestack-ui/themed';
import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates';
import { observer } from 'mobx-react-lite';

import { SplashScreen } from '@/components/Splash';
import { config } from '@/config/gluestack-ui.config';
import { useSession } from '@/hooks/useSession';
import RootStack from '@/navigation/RootStack';

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

export default observer(function App() {
  const { isLoading, session } = useSession();

  useEffect(() => {
    if (!__DEV__) {
      onFetchUpdateAsync();
    }
  }, []);

  if (isLoading) {
    // We haven't finished checking for the token yet
    return <SplashScreen />;
  }

  const isSignedIn = !!session;

  return (
    <GluestackUIProvider config={config}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <NavigationContainer>
          <RootStack isSignedIn={isSignedIn} />
        </NavigationContainer>
      </SafeAreaProvider>
    </GluestackUIProvider>
  );
});
