import React, { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

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
  ScrollView,
  Text,
  VStack,
} from '@gluestack-ui/themed';

import { BadRequestException } from '@/types/errors';

import { EmailInputControl } from '@components/inputs/controls/EmailInputControl';
import { PasswordInputControl } from '@components/inputs/controls/PasswordInputControl';
import { TextInputControl } from '@components/inputs/controls/TextInputControl';

import { AnonStackParamList } from '@navigation/AnonStack';

import { signUp } from '@services/emigro/auth';
import { RegisterUserRequest, Role } from '@services/emigro/types';

type Props = {
  navigation: NativeStackNavigationProp<AnonStackParamList, 'SignUp'>;
};

// for react-hook-form
type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
};

export const CreateAccount = ({ navigation }: Props) => {
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
      const { username } = await signUp(registerData);
      if (!username) {
        throw new Error(defaultErrorMesssage);
      }
      navigation.push('ConfirmAccount', { email: data.email, username });
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
    <ScrollView bg="$white">
      <Box flex={1} bg="$white">
        <VStack p="$4" space="lg">
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
            <HStack justifyContent="center">
              <Text size="lg">Already have an account?</Text>
              <Link onPress={() => navigation.replace('Login')}>
                <Text size="lg" color="$primary500" ml="$2" bold>
                  Sign in
                </Text>
              </Link>
            </HStack>
          </VStack>
        </VStack>
      </Box>
    </ScrollView>
  );
};
