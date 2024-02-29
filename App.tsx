import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { StatusBar } from 'expo-status-bar';
import { observer } from 'mobx-react-lite';

import { VendorContextProvider } from '@/contexts/VendorContext';
import { GluestackUIProvider, Text, Box } from "@gluestack-ui/themed"
import { config } from '@config/gluestack-ui.config';

import { Landing } from '@components/Landing';

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
          <Landing isSignedIn={isSignedIn} />
        </VendorContextProvider>
      </SafeAreaProvider>
    </GluestackUIProvider>
  );
});
