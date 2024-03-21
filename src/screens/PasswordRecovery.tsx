import { useState } from 'react';

import {
  Box,
  Button,
  ButtonText,
  HStack,
  Heading,
  Input,
  InputField,
  LockIcon,
  Text,
  VStack,
} from '@gluestack-ui/themed';

type Props = {
  navigation: any;
};

export const PasswordRecovery = ({ navigation }: Props) => {
  const [email, setEmail] = useState('');

  const handleSendEmail = () => {
    console.log('Email sent to: ', email);
    navigation.navigate('CreateNewPassword');
  };

  return (
    <Box flex={1} bg="$white">
      <VStack p="$4" space="4xl">
        <HStack alignItems="center">
          <LockIcon size="xl" color="red" mr="$2" />
          <Heading>Password Recovery</Heading>
        </HStack>
        <Text>Enter your email address and we will send you a link to reset your password.</Text>
        <Input size="xl">
          <InputField value={email} onChangeText={(text) => setEmail(text)} placeholder="example@email.com" />
        </Input>
        <Button size="xl" onPress={handleSendEmail}>
          <ButtonText>Send Email</ButtonText>
        </Button>
      </VStack>
    </Box>
  );
};
