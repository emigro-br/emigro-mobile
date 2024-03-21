import { useState } from 'react';

import {
  Box,
  Button,
  ButtonText,
  Heading,
  Input,
  InputField,
  Text,
  Toast,
  ToastDescription,
  ToastTitle,
  VStack,
  useToast,
} from '@gluestack-ui/themed';

type Props = {
  navigation: any;
};

export const CreateNewPassword = ({ navigation }: Props) => {
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleCreatePassword = () => {
    toast.show({
      duration: 3000,
      render: ({ id }) => (
        <Toast nativeID={`toast-${id}`} action="success" variant="accent">
          <VStack space="xs">
            <ToastTitle>Password created</ToastTitle>
            <ToastDescription>Your password has been created successfully</ToastDescription>
          </VStack>
        </Toast>
      ),
    });
    navigation.navigate('Login');
  };

  return (
    <Box flex={1} bg="$white">
      <VStack p="$4" space="2xl">
        <Heading>Create New Password</Heading>
        <Text>Enter your new password and confirm it.</Text>
        <Input size="lg">
          <InputField value={password} onChangeText={(text) => setPassword(text)} placeholder="at least 6 chars" />
        </Input>
        <Input size="lg">
          <InputField
            value={confirmPassword}
            onChangeText={(text) => setConfirmPassword(text)}
            placeholder="Confirm password"
          />
        </Input>
        <Button size="xl" onPress={handleCreatePassword}>
          <ButtonText>Create new password</ButtonText>
        </Button>
      </VStack>
    </Box>
  );
};
