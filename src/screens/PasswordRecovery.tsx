import { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

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
  useToast,
} from '@gluestack-ui/themed';

import { Toast } from '@components/Toast';

import { AnonStackParamList } from '@navigation/AnonStack';

import { resetPassword } from '@services/emigro/auth';

type Props = {
  navigation: NativeStackNavigationProp<AnonStackParamList, 'PasswordRecovery'>;
};

export const PasswordRecovery = ({ navigation }: Props) => {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    return cleanUp;
  }, []);

  const cleanUp = () => {
    setEmail('');
  };

  const handleSendEmail = async () => {
    Keyboard.dismiss(); // to see the toast message
    try {
      setIsSending(true);
      const result = await resetPassword(email);
      if (result.success) {
        navigation.navigate('CreateNewPassword', { email });
      }
    } catch (error) {
      const defaultError = 'Could not send the recovery e-mail, please try again later.';
      let message = defaultError;
      if (error instanceof Error) {
        message = error.message;
      }

      toast.show({
        duration: 10000,
        render: ({ id }) => (
          <Toast id={id} title="Failed to reset your password" description={message} action="error" />
        ),
      });
    } finally {
      setIsSending(false);
    }
  };

  // FIXME: use some validation library: react-hook-form, formik, yup
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  const isValidForm = isValidEmail(email);

  return (
    <Box flex={1} bg="$white">
      <VStack p="$4" space="4xl">
        <HStack alignItems="center">
          <LockIcon size="xl" color="red" mr="$2" />
          <Heading>Password Recovery</Heading>
        </HStack>
        <Text>Enter your email address and we will send you a instructions to reset your password.</Text>
        <Input size="xl">
          <InputField
            value={email}
            onChangeText={(text) => setEmail(text)}
            placeholder="example@email.com"
            autoCapitalize="none"
            keyboardType="email-address"
            onSubmitEditing={handleSendEmail}
          />
        </Input>
        <Button size="xl" onPress={handleSendEmail} isDisabled={!isValidForm || isSending}>
          <ButtonText>Send Email</ButtonText>
        </Button>
      </VStack>
    </Box>
  );
};
