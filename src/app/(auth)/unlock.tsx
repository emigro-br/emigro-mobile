import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Stack, useRouter } from 'expo-router';

import { Box } from '@/components/ui/box';
import { PinScreen } from '@/screens/PinScreen';
import { securityStore } from '@/stores/SecurityStore';
import { sessionStore } from '@/stores/SessionStore';

export const UnlockScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    if (unlocked) {
      router.replace('/');
    }
  }, [unlocked, router]);

  const handlePinFail = (error: Error) => {
    console.warn('Pin verification failed', error);
    sessionStore.signOut();
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false, animation: 'slide_from_bottom' }} />

      <Box className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
        <PinScreen
          tagline="Enter your PIN"
          btnLabel="Unlock"
          verifyPin={(pin) => securityStore.verifyPin(pin)}
          onPinSuccess={() => setUnlocked(true)}
          onPinFail={handlePinFail}
          autoSubmit
        />
      </Box>
    </>
  );
};

export default UnlockScreen;
