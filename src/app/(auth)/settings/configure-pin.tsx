import { useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useLocalSearchParams, useRouter } from 'expo-router';

import { PinScreen } from '@/components/screens/PinScreen';
import { Box } from '@/components/ui/box';
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
    <Box className={` pt-${insets.top} flex-1 `}>
      <PinScreen
        ref={pinRef}
        tagline={isReEnter ? 'Re-enter your PIN code' : 'Enter your new PIN code'}
        verifyPin={verifyPin}
        btnLabel={isReEnter ? 'Confirm PIN' : 'Next'}
        maxAttempts={1}
        onPinSuccess={handlePinSuccess}
        onPinFail={handlePinFail}
      />
      {/* {error && <Text color="$error500">{error}</Text>} */}
    </Box>
  );
};

export default ConfigurePIN;
