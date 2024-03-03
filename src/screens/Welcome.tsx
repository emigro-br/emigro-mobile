import React from 'react';

import { useNavigation } from '@react-navigation/native';

import { Box, Button, ButtonGroup, ButtonText, Center, Image, Text } from '@gluestack-ui/themed';

import emigroLogo from '@assets/images/emigro-logo.png';

export const Welcome: React.FunctionComponent = () => {
  const navigation = useNavigation();
  return (
    <Box flex={1} bg="$white">
      <Box bg="$primary500" pt="$40" pb="$20">
        <Center>
          <Box h="$20" w="$80" mb="$10">
            <Image h="$full" w="$full" source={emigroLogo} alt="Emigro logo" />
          </Box>
          <Text size="2xl" color="$white" bold mb="$2">
            The Traveler's Digital Wallet
          </Text>
          <Text size="lg" color="$white">
            Instant cross-border payments
          </Text>
        </Center>
      </Box>

      <ButtonGroup flexDirection="column" mx="$4" mt="$10">
        <Button onPress={() => navigation.navigate('Login' as never)} variant="solid" size="lg">
          <ButtonText>Login</ButtonText>
        </Button>
        <Button onPress={() => navigation.navigate('SignUp' as never)} variant="outline" size="lg">
          <ButtonText>Create an Account</ButtonText>
        </Button>
      </ButtonGroup>
    </Box>
  );
};
