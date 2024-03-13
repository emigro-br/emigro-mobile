import { useEffect, useState } from 'react';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Box } from '@gluestack-ui/themed';

import { RootStackParamList } from '@navigation/RootStack';

import { sessionStore } from '@stores/SessionStore';

import { PinScreen } from './PinScreen';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Unlock'>;
};

export const UnlockScreen = ({ navigation }: Props) => {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    if (unlocked) {
      navigation.replace('Root');
    }
  }, [unlocked, navigation]);

  const handlePinFail = (error: Error) => {
    console.warn('Pin verification failed', error);
    sessionStore.signOut();
  };

  return (
    <Box flex={1} pt="$12">
      <PinScreen
        tagline="Enter your PIN"
        btnLabel="Unlock"
        verifyPin={(pin) => sessionStore.verifyPin(pin)}
        onPinSuccess={() => setUnlocked(true)}
        onPinFail={handlePinFail}
      />
    </Box>
  );
};
