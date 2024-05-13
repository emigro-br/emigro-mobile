import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box } from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';

import { PinScreen } from '@/components/PinScreen';
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
    <Box flex={1} bg="$white" pt={insets.top}>
      <PinScreen
        tagline="Enter your PIN"
        btnLabel="Unlock"
        verifyPin={(pin) => securityStore.verifyPin(pin)}
        onPinSuccess={() => setUnlocked(true)}
        onPinFail={handlePinFail}
        autoSubmit
      />
    </Box>
  );
};

export default UnlockScreen;
