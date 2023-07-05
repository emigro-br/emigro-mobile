import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Landing } from '@components/Landing';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Landing />
    </SafeAreaProvider>
  );
}
