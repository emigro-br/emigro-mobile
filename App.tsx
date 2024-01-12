import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { VendorContextProvider } from '@/contexts/VendorContext';

import { SplashScreen } from '@screens/Splash';
import { Landing } from '@components/Landing';
import { useEffect, useState } from 'react';
import { clearSession, getAccessToken } from '@/storage/helpers';
import { getUserProfile } from '@/services/emigro';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null); // Update the type of userToken

  const getUserToken = async () => {
    try {
      const token = await getAccessToken();
      if (token) {
        try {
          // FIXME: this is a workaround to check if token is valid. 
          const userProfile = await getUserProfile();
          if (userProfile) {
            setUserToken(token);
          }
        } catch (error) {     
          // TODO: regresh token if it is expired
          clearSession();
        }
      }
    }
     finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getUserToken();
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
