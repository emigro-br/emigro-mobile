import { Stack } from 'expo-router';

import Header from '@/components/Header';
import defaultScreenOptions from '@/navigation/screenOptions';

export default function Layout() {
  return (
    <Stack screenOptions={{ ...defaultScreenOptions, headerShown: true }}>
      <Stack.Screen name="index" options={{ title: 'Payments', header: () => <Header />, headerShown: true }} />
      <Stack.Screen name="scan" options={{ title: 'Scan a Payment', headerShown: false }} />
      <Stack.Screen
        name="confirm"
        options={{
          title: 'Confirm Payment',
          headerBackTitle: 'Back',
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen name="request/index" options={{ title: 'Request Payment' }} />
      <Stack.Screen
        name="request/show-qr-code"
        options={{
          title: 'Request with QR Code',
          headerShown: false,
          gestureEnabled: false, // disable swap back gesture
          presentation: 'modal',
        }}
      />
      <Stack.Screen name="pix/copia-e-cola" options={{ title: 'Pay with Pix' }} />
    </Stack>
  );
}
