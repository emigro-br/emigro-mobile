import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Keyboard } from 'react-native';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Box, Button, ButtonText, HStack, Heading, LockIcon, Text, VStack, useToast } from '@gluestack-ui/themed';

import { Toast } from '@components/Toast';
import { EmailInputControl } from '@components/inputs/controls/EmailInputControl';

import { AnonStackParamList } from '@navigation/AnonStack';

import { resetPassword } from '@services/emigro/auth';

// for react-hook-form
type FormData = {
  email: string;
};

type Props = {
  navigation: NativeStackNavigationProp<AnonStackParamList, 'PasswordRecovery'>;
};

export const PasswordRecovery = ({ navigation }: Props) => {
  const toast = useToast();
  const [isSending, setIsSending] = useState(false);
  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: {
      email: '',
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    Keyboard.dismiss(); // to see the toast message
    setIsSending(true);
    try {
      const { email } = data;
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

  return (
    <Box flex={1} bg="$white">
      <VStack p="$4" space="4xl">
        <HStack alignItems="center">
          <LockIcon size="xl" color="red" mr="$2" />
          <Heading>Password Recovery</Heading>
        </HStack>
        <Text>Enter your email address and we will send you a instructions to reset your password.</Text>
        <EmailInputControl control={control} name="email" />
        <Button size="xl" onPress={handleSubmit(onSubmit)} isDisabled={isSending}>
          <ButtonText>Send Email</ButtonText>
        </Button>
      </VStack>
    </Box>
  );
};
