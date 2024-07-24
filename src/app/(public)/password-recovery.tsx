import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Keyboard } from 'react-native';

import { useRouter } from 'expo-router';

import { Toast } from '@/components/Toast';
import { EmailInputControl } from '@/components/inputs/controls/EmailInputControl';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { LockIcon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useToast } from '@/components/ui/toast';
import { VStack } from '@/components/ui/vstack';
import { resetPassword } from '@/services/emigro/auth';

// for react-hook-form
type FormData = {
  email: string;
};

export const PasswordRecovery = () => {
  const router = useRouter();
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
        router.push({ pathname: '/create-password', params: { email } });
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
    <Box className="flex-1 bg-white">
      <VStack space="4xl" className="p-4">
        <HStack className="items-center">
          <LockIcon size="xl" className="text-[red] mr-2" />
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

export default PasswordRecovery;
