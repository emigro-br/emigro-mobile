import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { VendorContextProvider } from '@/contexts/VendorContext';

import { SplashScreen } from '@screens/Splash';
import { Landing } from '@components/Landing';
import { useEffect, useState } from 'react';
import { clearSession, getSession, saveSession } from '@/storage/helpers';
import { refresh as refreshSession } from '@/services/auth';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null); // Update the type of userToken

  const bootstrapAsync = async () => {
    try {
      let authSession = await getSession();
      if (authSession) {
        const isTokenExpired = authSession.tokenExpirationDate < new Date();
        if (isTokenExpired){
          console.debug('Refreshing session...');
          const newSession = await refreshSession(authSession);
          if (newSession) {
            saveSession(newSession);
            authSession = newSession;
          } else {
            throw new Error('Can not refresh session');
          }
        } 
        setUserToken(authSession.accessToken);
      }
    } catch (error) {
      console.warn('Can not load the token, cleaning session', error);
      await clearSession();
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

  return (
    <SafeAreaProvider>
      <VendorContextProvider>
        <StatusBar style="dark" />
        <Landing isSignedIn={!!userToken} />
      </VendorContextProvider>
    </SafeAreaProvider>
  );
}
