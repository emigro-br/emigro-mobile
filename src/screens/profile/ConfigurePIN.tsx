import { useRef, useState } from 'react';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Box } from '@gluestack-ui/themed';

import { ProfileStackParamList } from '@navigation/ProfileStack';

import { PIN } from '@screens/PIN';

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
  // const [error, setError] = useState('');
  const [isReEnter, setIsReEnter] = useState(false);

  const handlePinSuccess = async (enteredPin: string) => {
    if (!isReEnter) {
      setPin(enteredPin);
      setIsReEnter(true);
    } else {
      if (enteredPin === pin) {
        await sessionStore.savePin(enteredPin);
        navigation.popToTop();
      } else {
        // setError('PINs do not match');
        setIsReEnter(false);
        setPin('');
      }
    }

    pinRef.current?.clear();
  };

  return (
    <Box flex={1} bg="$white">
      <PIN
        ref={pinRef}
        title={isReEnter ? 'Re-enter your PIN code' : 'Enter your new PIN code'}
        btnLabel="Submit"
        onPinSuccess={handlePinSuccess}
        onPinFail={() => console.log('PIN fail')}
      />
      {/* {error && <Text color="$error500">{error}</Text>} */}
    </Box>
  );
};
