import { useRef, useState } from 'react';

import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Box } from '@gluestack-ui/themed';

import { PinScreen } from '@/components/PinScreen';
import { ProfileStackParamList } from '@/navigation/ProfileStack';
import { RootStackParamList } from '@/navigation/RootStack';
import { sessionStore } from '@/stores/SessionStore';

type PinRefType = {
  clear: () => void;
};

type Props = CompositeScreenProps<
  NativeStackScreenProps<ProfileStackParamList, 'ConfigurePIN'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const ConfigurePIN = ({ navigation, route }: Props) => {
  let backTo: string | undefined;
  if (route.params) {
    backTo = route.params.backTo;
  }
  const pinRef = useRef<PinRefType | null>(null);
  const [pin, setPin] = useState('');
  const [isReEnter, setIsReEnter] = useState(false);

  const handlePinSuccess = async (enteredPin: string) => {
    if (!isReEnter) {
      setPin(enteredPin);
      setIsReEnter(true);
    } else {
      await sessionStore.savePin(enteredPin);
      if (backTo === 'Root') {
        navigation.replace('Root');
      } else {
        navigation.popToTop();
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
