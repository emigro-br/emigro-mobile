import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { VendorContextProvider } from '@/contexts/VendorContext';

import { Landing } from '@components/Landing';

export default function App() {
  return (
    <SafeAreaProvider>
      <VendorContextProvider>
        <StatusBar style="dark" />
        <Landing />
      </VendorContextProvider>
    </SafeAreaProvider>
  );
}
