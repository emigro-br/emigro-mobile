import React from 'react';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Box, Button, ButtonGroup, ButtonText, Center, Image, Text } from '@gluestack-ui/themed';

import emigroLogo from '@assets/images/emigro-logo.png';

import { AnonStackParamList } from '@navigation/AnonStack';

type Props = {
  navigation: NativeStackNavigationProp<AnonStackParamList, 'Welcome'>;
};

export const Welcome = ({ navigation }: Props) => {
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

      <ButtonGroup flexDirection="column" space="md" size="xl" mx="$4" mt="$8">
        <Button onPress={() => navigation.push('Login')} variant="solid">
          <ButtonText>Login</ButtonText>
        </Button>
        <Button onPress={() => navigation.push('SignUp')} variant="outline">
          <ButtonText>Create an Account</ButtonText>
        </Button>
      </ButtonGroup>
    </Box>
  );
};
