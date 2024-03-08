import { SafeAreaProvider } from 'react-native-safe-area-context';

import { NavigationContainer } from '@react-navigation/native';

import { VendorContextProvider } from '@contexts/VendorContext';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { StatusBar } from 'expo-status-bar';
import { observer } from 'mobx-react-lite';

import { config } from '@config/gluestack-ui.config';

import { useSession } from '@hooks/useSession';

import RootStack from '@navigation/RootStack';

import { SplashScreen } from '@screens/Splash';

export default observer(function App() {
  const { isLoading, session } = useSession();

  if (isLoading) {
    // We haven't finished checking for the token yet
    return <SplashScreen />;
  }

  const isSignedIn = !!session;

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
