import { useRef, useState } from 'react';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Box } from '@gluestack-ui/themed';

import { ProfileStackParamList } from '@navigation/ProfileStack';

import { PinScreen } from '@screens/PinScreen';

import { sessionStore } from '@stores/SessionStore';

type PinRefType = {
  clear: () => void;
};

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'ConfigurePIN'>;
};

export const ConfigurePIN = ({ navigation }: Props) => {
  const pinRef = useRef<PinRefType | null>(null);
  const [pin, setPin] = useState('');
  const [isReEnter, setIsReEnter] = useState(false);

  const handlePinSuccess = async (enteredPin: string) => {
    if (!isReEnter) {
      setPin(enteredPin);
      setIsReEnter(true);
    } else {
      await sessionStore.savePin(enteredPin);
      navigation.popToTop();
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
    <Box flex={1}>
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
