import React, { useRef, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  AlertCircleIcon,
  Box,
  Button,
  ButtonText,
  EyeIcon,
  EyeOffIcon,
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
  HStack,
  Heading,
  Input,
  InputField,
  InputIcon,
  InputSlot,
  Link,
  LinkText,
  Text,
  VStack,
} from '@gluestack-ui/themed';

import { BadRequestException } from '@/types/errors';

import { AnonStackParamList } from '@navigation/AnonStack';

import { sessionStore } from '@stores/SessionStore';

// for react-hook-form
type FormData = {
  email: string;
  password: string;
};

type Props = {
  navigation: NativeStackNavigationProp<AnonStackParamList, 'Login'>;
};

const Login = ({ navigation }: Props) => {
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setShowPassword(false);
    setApiError(null);
    setIsLoggingIn(true);
    try {
      const { email, password } = data;
      await sessionStore.signIn(email, password);
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

  const handleState = () => {
    setShowPassword((showState) => {
      return !showState;
    });
  };

  return (
    <Box flex={1} bg="$white">
      <VStack p="$4" space="lg">
        <Heading size="xl">Sign in to Emigro</Heading>
        <VStack space="2xl">
          <Controller
            name="email"
            rules={{
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                message: 'Invalid email address',
              },
            }}
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <FormControl isInvalid={!!errors.email}>
                <FormControlLabel mb="$1">
                  <FormControlLabelText>Email</FormControlLabelText>
                </FormControlLabel>
                <Input size="xl">
                  <InputField
                    ref={emailRef}
                    placeholder="example@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="next"
                    testID="email"
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                    onSubmitEditing={() => passwordRef.current?.focus()}
                  />
                </Input>
                {errors.email && (
                  <FormControlError>
                    <FormControlErrorText>{errors.email.message}</FormControlErrorText>
                  </FormControlError>
                )}
              </FormControl>
            )}
          />

          <Controller
            name="password"
            rules={{
              required: 'Password is required',
              minLength: { value: 8, message: 'Password must be at least 8 characters' },
            }}
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <FormControl isInvalid={!!errors.password}>
                <FormControlLabel mb="$1">
                  <FormControlLabelText>Password</FormControlLabelText>
                </FormControlLabel>
                <Input size="xl">
                  <InputField
                    ref={passwordRef}
                    type={!showPassword ? 'password' : 'text'}
                    placeholder="Enter your password"
                    keyboardType="default"
                    autoCapitalize="none"
                    returnKeyType="done"
                    testID="password"
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                    onSubmitEditing={handleSubmit(onSubmit)}
                    blurOnSubmit
                  />
                  <InputSlot pr="$3" onPress={handleState}>
                    <InputIcon
                      as={showPassword ? EyeIcon : EyeOffIcon}
                      color={showPassword ? '$primary500' : '$textLight500'}
                    />
                  </InputSlot>
                </Input>
                {errors.password && (
                  <FormControlError>
                    <FormControlErrorText>{errors.password?.message}</FormControlErrorText>
                  </FormControlError>
                )}
              </FormControl>
            )}
          />

          <Link onPress={() => navigation.push('PasswordRecovery')} testID="forgot-password-link">
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
            <Link onPress={() => navigation.replace('SignUp')}>
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
