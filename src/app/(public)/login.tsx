import React, { useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import {
  AlertCircleIcon,
  Box,
  Button,
  ButtonText,
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  HStack,
  Heading,
  Link,
  LinkText,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';

import { EmailInputControl } from '@/components/inputs/controls/EmailInputControl';
import { PasswordInputControl } from '@/components/inputs/controls/PasswordInputControl';
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
    <Box flex={1} bg="$white">
      <VStack p="$4" space="lg">
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
            <LinkText color="$primary500" textDecorationLine="none" textAlign="right">
              Forgot your password?
            </LinkText>
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
          <HStack justifyContent="center">
            <Text size="lg">Don't have an account?</Text>
            <Link onPress={() => router.replace('/signup')}>
              <Text size="lg" color="$primary500" ml="$2" bold>
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
