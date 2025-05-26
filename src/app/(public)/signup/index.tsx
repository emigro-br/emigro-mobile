import React, { useState, useRef } from 'react';
import { Animated, Pressable, TextInput } from 'react-native';
import { SubmitHandler, useForm, Controller } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Link } from '@/components/ui/link';
import { ScrollView } from '@/components/ui/scroll-view';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
} from '@/components/ui/form-control';
import { AlertCircleIcon } from '@/components/ui/icon';
import { signUp } from '@/services/emigro/auth';
import { RegisterUserRequest, Role } from '@/services/emigro/types';
import { BadRequestException } from '@/types/errors';

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
};

const CreateAccount = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: Role.CUSTOMER,
    },
  });

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setApiError(null);
    const defaultErrorMessage = 'An error occurred while creating your account. Please try again.';
    try {
      const registerData: RegisterUserRequest = { ...data };
      const { externalId } = await signUp(registerData);
      if (!externalId) throw new Error(defaultErrorMessage);

      router.push({ pathname: '/signup/confirm', params: { email: data.email, externalId } });
    } catch (error) {
      if (error instanceof BadRequestException) {
        setApiError(defaultErrorMessage);
      } else if (error instanceof Error) {
        setApiError(error.message);
      } else {
        setApiError(defaultErrorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = (field: string) => ({
    backgroundColor: '#1a1a1a',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 20,
    fontSize: 16,
    textAlign: 'center' as const,
    color: 'white',
    borderWidth: 1,
    borderColor: focusedField === field ? '#ff0033' : '#333',
  });

  return (
    <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <ScrollView className="bg-black flex-1">
        <Box className="flex-1 p-6 justify-center">
          <VStack space="lg">
            <Heading size="xl" className="text-white text-center mb-6">
              Sign up to Emigro
            </Heading>

            <VStack space="xl">
              {/* First Name */}
              <Controller
                control={control}
                name="firstName"
                rules={{ required: true }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    placeholder="First Name"
                    placeholderTextColor="#888"
                    value={value}
                    onChangeText={onChange}
                    onFocus={() => setFocusedField('firstName')}
                    onBlur={() => setFocusedField(null)}
                    style={inputStyle('firstName')}
                  />
                )}
              />

              {/* Last Name */}
              <Controller
                control={control}
                name="lastName"
                rules={{ required: true }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    placeholder="Last Name"
                    placeholderTextColor="#888"
                    value={value}
                    onChangeText={onChange}
                    onFocus={() => setFocusedField('lastName')}
                    onBlur={() => setFocusedField(null)}
                    style={inputStyle('lastName')}
                  />
                )}
              />

              {/* Email */}
              <Controller
                control={control}
                name="email"
                rules={{ required: true }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    placeholder="Email"
                    placeholderTextColor="#888"
                    value={value}
                    onChangeText={onChange}
                    keyboardType="email-address"
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    style={inputStyle('email')}
                  />
                )}
              />

              {/* Password */}
              <Controller
                control={control}
                name="password"
                rules={{ required: true }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    placeholder="Password"
                    placeholderTextColor="#888"
                    value={value}
                    onChangeText={onChange}
                    secureTextEntry
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    style={inputStyle('password')}
                  />
                )}
              />

              {/* API Error */}
              {apiError && (
                <FormControl isInvalid={!!apiError}>
                  <FormControlError>
                    <FormControlErrorIcon as={AlertCircleIcon} />
                    <FormControlErrorText>{apiError}</FormControlErrorText>
                  </FormControlError>
                </FormControl>
              )}

              {/* Create Account Button */}
              <Pressable onPressIn={animatePress} onPress={handleSubmit(onSubmit)} disabled={isLoading}>
                <Animated.View
                  style={{ transform: [{ scale: scaleAnim }] }}
                  className={`bg-primary-500 rounded-full py-4 items-center justify-center mt-4 ${
                    isLoading ? 'opacity-50' : ''
                  }`}
                >
                  <Text className="text-white font-bold text-lg">
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Text>
                </Animated.View>
              </Pressable>

              {/* Sign In link */}
              <HStack className="justify-center mt-6">
                <Text size="md" className="text-white">
                  Already have an account?
                </Text>
                <Link onPress={() => router.replace('/login')}>
                  <Text size="md" bold className="text-primary-500 ml-2">
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
