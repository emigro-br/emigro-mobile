import React, { useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { useRouter } from 'expo-router';

import { EmailInputControl } from '@/components/inputs/controls/EmailInputControl';
import { PasswordInputControl } from '@/components/inputs/controls/PasswordInputControl';
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
import { Link, LinkText } from '@/components/ui/link';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { sessionStore } from '@/stores/SessionStore';
import { BadRequestException } from '@/types/errors';

// for react-hook-form
type FormData = {
  email: string;
  password: string;
};

const Login = () => {
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    // setShowPassword(false);
    setApiError(null);
    setIsLoggingIn(true);
    try {
      const { email, password } = data;
      await sessionStore.signIn(email, password);
      router.replace('/');
    } catch (error) {
      if (error instanceof BadRequestException) {
        console.warn('Error', error);
        setApiError('Invalid login or password');
      } else if (error instanceof Error) {
        setApiError(error.message);
      } else {
        setApiError('An unknown error occurred');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <Box className="flex-1 bg-white">
      <VStack space="lg" className="p-4">
        <Heading size="xl">Sign in to Emigro</Heading>
        <VStack space="2xl">
          <EmailInputControl
            control={control}
            name="email"
            mRef={emailRef}
            onSubmitEditing={() => passwordRef?.current?.focus()}
          />
          <PasswordInputControl
            control={control}
            name="password"
            mRef={passwordRef}
            onSubmitEditing={handleSubmit(onSubmit)}
          />

          <Link onPress={() => router.push('/password-recovery')} testID="forgot-password-link">
            <LinkText className="text-primary-500 no-underline text-right">Forgot your password?</LinkText>
          </Link>

          {apiError && (
            <FormControl isInvalid>
              <FormControlError>
                <FormControlErrorIcon as={AlertCircleIcon} />
                <FormControlErrorText>{apiError}</FormControlErrorText>
              </FormControlError>
            </FormControl>
          )}
          <Button onPress={handleSubmit(onSubmit)} isDisabled={isLoggingIn} size="xl" testID="signin-button">
            <ButtonText>{isLoggingIn ? 'Signing in...' : 'Sign in'}</ButtonText>
          </Button>
          <HStack className="justify-center">
            <Text size="lg">Don't have an account?</Text>
            <Link onPress={() => router.replace('/signup')}>
              <Text size="lg" bold className="text-primary-500 ml-2">
                Sign up
              </Text>
            </Link>
          </HStack>
        </VStack>
      </VStack>
    </Box>
  );
};

export default Login;
