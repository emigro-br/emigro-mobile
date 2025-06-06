import { useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { Box } from '@/components/ui/box';
import { PinScreen } from '@/screens/PinScreen';
import { securityStore } from '@/stores/SecurityStore';

type PinRefType = {
  clear: () => void;
};

export const ConfigurePIN = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { backTo } = useLocalSearchParams<{ backTo: string }>();

  const pinRef = useRef<PinRefType | null>(null);
  const [pin, setPin] = useState('');
  const [isReEnter, setIsReEnter] = useState(false);

  const handlePinSuccess = async (enteredPin: string) => {
    if (!isReEnter) {
      setPin(enteredPin);
      setIsReEnter(true);
    } else {
      await securityStore.savePin(enteredPin);
      if (backTo) {
        router.replace(backTo);
      } else {
        router.back();
      }
    }

    pinRef.current?.clear();
  };

  const handlePinFail = () => {
    setIsReEnter(false);
    setPin('');
    pinRef.current?.clear();
  };

  const verifyPin = async (enteredPin: string) => {
    if (!isReEnter) {
      return true;
    }

    if (enteredPin === pin) {
      return true;
    }
    throw new Error('PINs do not match');
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false, animation: 'slide_from_bottom' }} />

      <Box className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
        <PinScreen
          ref={pinRef}
          tagline={isReEnter ? 'Re-enter your PIN code' : 'Enter your new PIN code'}
          verifyPin={verifyPin}
          btnLabel={isReEnter ? 'Confirm PIN' : 'Next'}
          maxAttempts={1}
          onPinSuccess={handlePinSuccess}
          onPinFail={handlePinFail}
        />
        {/* {error && <Text className="text-error-500">{error}</Text>} */}
      </Box>
    </>
  );
};

export default ConfigurePIN;
