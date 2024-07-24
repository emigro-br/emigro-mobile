import React, { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { useRouter } from 'expo-router';

import { EmailInputControl } from '@/components/inputs/controls/EmailInputControl';
import { PasswordInputControl } from '@/components/inputs/controls/PasswordInputControl';
import { TextInputControl } from '@/components/inputs/controls/TextInputControl';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
} from '@/components/ui/form-control';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { AlertCircleIcon } from '@/components/ui/icon';
import { Link } from '@/components/ui/link';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { signUp } from '@/services/emigro/auth';
import { RegisterUserRequest, Role } from '@/services/emigro/types';
import { BadRequestException } from '@/types/errors';

// for react-hook-form
type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
};

export const CreateAccount = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: Role.CUSTOMER,
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setApiError(null);
    const defaultErrorMesssage = 'An error occurred while creating your account. Please try again.';
    try {
      const registerData: RegisterUserRequest = { ...data };
      const { externalId } = await signUp(registerData);
      if (!externalId) {
        throw new Error(defaultErrorMesssage);
      }
      router.push({ pathname: '/signup/confirm', params: { email: data.email, externalId } });
    } catch (error) {
      if (error instanceof BadRequestException) {
        console.warn('Error', error);
        setApiError(defaultErrorMesssage);
      } else if (error instanceof Error) {
        setApiError(error.message);
      } else {
        setApiError(defaultErrorMesssage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollView contentContainerStyle={{ flex: 1 }}>
      <ScrollView className="bg-white flex-1">
        <Box className="flex-1">
          <VStack space="lg" className="p-4">
            <Heading size="xl">Sign up to Emigro</Heading>
            <VStack space="xl">
              <TextInputControl control={control} name="firstName" label="First Name" placeholder="e.g. John" />
              <TextInputControl control={control} name="lastName" label="Last Name" placeholder="e.g. Doe" />
              <EmailInputControl control={control} name="email" />
              <PasswordInputControl control={control} name="password" validationFull />

              {apiError && (
                <FormControl isInvalid={!!apiError}>
                  <FormControlError>
                    <FormControlErrorIcon as={AlertCircleIcon} />
                    <FormControlErrorText>{apiError}</FormControlErrorText>
                  </FormControlError>
                </FormControl>
              )}

              <Button onPress={handleSubmit(onSubmit)} isDisabled={isLoading} size="xl" testID="create-button">
                <ButtonText>{isLoading ? 'Creating account...' : 'Create Account'}</ButtonText>
              </Button>
              <HStack className="justify-center">
                <Text size="lg">Already have an account?</Text>
                <Link onPress={() => router.replace('/login')}>
                  <Text size="lg" bold className="text-primary-500 ml-2">
                    Sign in
                  </Text>
                </Link>
              </HStack>
            </VStack>
          </VStack>
        </Box>
      </ScrollView>
    </KeyboardAwareScrollView>
  );
};

export default CreateAccount;
