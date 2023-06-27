import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Landing } from '@components/Landing';

export default function App() {
  return (
    <SafeAreaProvider>
      <Landing />
    </SafeAreaProvider>
  );
}
