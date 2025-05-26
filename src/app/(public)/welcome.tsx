import React from 'react';
import { useRouter } from 'expo-router';
import { ImageBackground, StyleSheet } from 'react-native';

import emigroLogo from '@/assets/images/emigro-logo.png';
import backgroundImage from '@/assets/images/background.png';

import { Box } from '@/components/ui/box';
import { Button, ButtonGroup, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';

export const Welcome = () => {
  const router = useRouter();

  return (
    <ImageBackground source={backgroundImage} style={styles.background} resizeMode="cover">
      <Box className="flex-1 px-4 justify-between py-20">
        <Center className="mt-20">
          <Image source={emigroLogo} alt="Emigro logo" className="h-20 w-80 mb-10" />
          <Text size="2xl" bold className="text-white mb-2 text-center">
            The Traveler's Digital Wallet
          </Text>
          <Text size="lg" className="text-white text-center">
            Instant cross-border payments
          </Text>
        </Center>

        <ButtonGroup space="md" flexDirection="column">
          {/* Login Button */}
          <Button
            onPress={() => router.push('/login')}
            variant="solid"
            size="xl"
            className="rounded-full bg-primary-700"
          >
            <ButtonText className="text-white">Login</ButtonText>
          </Button>

          {/* Create Account Button */}
          <Button
            onPress={() => router.push('/signup')}
            variant="outline"
            size="xl"
            className="rounded-full border-white"
          >
            <ButtonText className="text-white">Create Account</ButtonText>
          </Button>
        </ButtonGroup>
      </Box>
    </ImageBackground>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
