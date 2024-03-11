import { useRef, useState } from 'react';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Box } from '@gluestack-ui/themed';

import { ProfileStackParamList } from '@navigation/ProfileStack';

import { PIN } from '@screens/PIN';

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

  const handlePinSuccess = (enteredPin: string) => {
    if (!isReEnter) {
      setPin(enteredPin);
      setIsReEnter(true);
    } else {
      if (enteredPin === pin) {
        console.log('PIN set: ', pin);
        // Save the PIN and navigate to the next screen
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
        title={isReEnter ? 'Re-enter your PIN code' : 'Enter your PIN code'}
        btnLabel="Submit"
        onPinSuccess={handlePinSuccess}
        onPinFail={() => console.log('PIN fail')}
      />
      {/* {error && <Text color="$error500">{error}</Text>} */}
    </Box>
  );
};
