import React from 'react';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';

import emigroLogo from '@/assets/images/emigro-logo.png';
import { Box } from '@/components/ui/box';
import { Button, ButtonGroup, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';

export const Welcome = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  return (
    <Box className={`flex-1 ${isDarkMode ? 'bg-background-900' : 'bg-white'}`}>
      <Box className="bg-primary-500 pt-40 pb-20">
        <Center>
          <Box className="h-20 w-80 mb-10">
            <Image source={emigroLogo} alt="Emigro logo" className="h-full w-full" />
          </Box>
          <Text size="2xl" bold className="text-white mb-2">
            The Traveler's Digital Wallet
          </Text>
          <Text size="lg" className="text-white">
            Instant cross-border payments
          </Text>
        </Center>
      </Box>

      <ButtonGroup space="md" flexDirection="column" className="mx-4 mt-8">
        {/* Login Button */}
        <Button
          onPress={() => router.push('/login')}
          variant="solid"
          size="xl"
          className="rounded-full"
        >
          <ButtonText className="text-white">Login</ButtonText>
        </Button>

        {/* Create Account Button */}
        <Button
          onPress={() => router.push('/signup')}
          variant="outline"
          size="xl"
          className="rounded-full border-primary-500"
        >
          <ButtonText className="text-primary-500">Create an Account</ButtonText>
        </Button>
      </ButtonGroup>
    </Box>
  );
};

export default Welcome;
