import React, { useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { SubmitHandler, useForm, Controller } from 'react-hook-form';
import { useRouter } from 'expo-router';

import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Link, LinkText } from '@/components/ui/link';
import { sessionStore } from '@/stores/SessionStore';
import { BadRequestException } from '@/types/errors';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
} from '@/components/ui/form-control';
import { AlertCircleIcon } from '@/components/ui/icon';

type FormData = {
  email: string;
  password: string;
};

const Login = () => {
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);

  const { control, handleSubmit, formState } = useForm<FormData>({
    defaultValues: { email: '', password: '' },
  });

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setApiError(null);
    setIsLoggingIn(true);
    try {
      await sessionStore.signIn(data.email, data.password);
      await sessionStore.fetchProfile();
      router.replace('/');
    } catch (error) {
      if (error instanceof BadRequestException) {
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

  const { isDirty, isValid } = formState;
  const isDisabled = !isDirty || !isValid || isLoggingIn;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <Box className="flex-1 bg-black justify-center">
            <VStack space="lg" className="p-6">
              <Heading size="xl" className="text-white text-center mb-6">
                Sign in to Emigro
              </Heading>

              <VStack space="xl">
                {/* Email input */}
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
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      style={{
                        backgroundColor: '#1a1a1a',
                        borderRadius: 30,
                        paddingVertical: 12,
                        paddingHorizontal: 20,
                        fontSize: 16,
                        textAlign: 'center',
                        color: 'white',
                        borderWidth: 1,
                        borderColor: focusedField === 'email' ? '#ff0033' : '#333',
                      }}
                    />
                  )}
                />

                {/* Password input */}
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
                      style={{
                        backgroundColor: '#1a1a1a',
                        borderRadius: 30,
                        paddingVertical: 12,
                        paddingHorizontal: 20,
                        fontSize: 16,
                        textAlign: 'center',
                        color: 'white',
                        borderWidth: 1,
                        borderColor: focusedField === 'password' ? '#ff0033' : '#333',
                      }}
                    />
                  )}
                />

                {/* Forgot password */}
                <Link onPress={() => router.push('/password-recovery')}>
                  <LinkText className="text-primary-500 text-right mt-2">
                    Forgot your password?
                  </LinkText>
                </Link>

                {/* API Error */}
                {apiError && (
                  <FormControl isInvalid>
                    <FormControlError>
                      <FormControlErrorIcon as={AlertCircleIcon} />
                      <FormControlErrorText>{apiError}</FormControlErrorText>
                    </FormControlError>
                  </FormControl>
                )}

                {/* Sign in button */}
                <Pressable
                  onPressIn={animatePress}
                  onPress={handleSubmit(onSubmit)}
                  disabled={isDisabled}
                >
                  <Animated.View
                    style={{ transform: [{ scale: scaleAnim }] }}
                    className={`bg-primary-500 rounded-full py-4 items-center justify-center mt-4 ${
                      isDisabled ? 'opacity-50' : ''
                    }`}
                  >
                    <Text className="text-white font-bold text-lg">
                      {isLoggingIn ? 'Signing in...' : 'Sign in'}
                    </Text>
                  </Animated.View>
                </Pressable>

                {/* Sign up link */}
                <HStack className="justify-center mt-6">
                  <Text size="md" className="text-white">
                    Don't have an account?
                  </Text>
                  <Link onPress={() => router.replace('/signup')}>
                    <Text size="md" bold className="text-primary-500 ml-2">
                      Sign up
                    </Text>
                  </Link>
                </HStack>
              </VStack>
            </VStack>
          </Box>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default Login;
