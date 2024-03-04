import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { NavigationContainer } from '@react-navigation/native';

import { GluestackUIProvider } from '@gluestack-ui/themed';
import { StatusBar } from 'expo-status-bar';
import { observer } from 'mobx-react-lite';

import { VendorContextProvider } from '@/contexts/VendorContext';

import { config } from '@config/gluestack-ui.config';

import RootStack from '@navigation/RootStack';

import { SplashScreen } from '@screens/Splash';

import { sessionStore } from '@stores/SessionStore';

export default observer(function App() {
  const [isLoading, setIsLoading] = useState(true);

  const bootstrapAsync = async () => {
    try {
      const authSession = await sessionStore.load();
      if (authSession) {
        // always refresh the session on app start
        console.debug('Refreshing session...');
        const newSession = await sessionStore.refresh();
        if (!newSession) {
          throw new Error('Can not refresh the session');
        }
      }
    } catch (error) {
      console.warn('Can not load the token, cleaning session', error);
      await sessionStore.clear();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    bootstrapAsync();
  }, []);

  if (isLoading) {
    // We haven't finished checking for the token yet
    return <SplashScreen />;
  }

  const isSignedIn = !!sessionStore.session;

  return (
    <GluestackUIProvider config={config}>
      <SafeAreaProvider>
        <VendorContextProvider>
          <StatusBar style="dark" />
          <NavigationContainer>
            <RootStack isSignedIn={isSignedIn} />
          </NavigationContainer>
        </VendorContextProvider>
      </SafeAreaProvider>
    </GluestackUIProvider>
  );
});
