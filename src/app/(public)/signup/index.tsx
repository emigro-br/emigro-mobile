import React, { useState, useRef } from 'react';
import {
  Animated,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  SafeAreaView,
  ViewStyle,
  View,
  ActivityIndicator,
} from 'react-native';

import { SubmitHandler, useForm, Controller } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Link } from '@/components/ui/link';
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
  confirmPassword: string;
  referralCode?: string; // NEW
  role: Role;
};

const BAR_BG = '#2a2a2a';
const BAR_ACTIVE = '#fe0055';

const CreateAccount = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1); // Step 1 (names), Step 2 (credentials+ref)

  const { control, handleSubmit, getValues, trigger, formState } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      referralCode: '',
      role: Role.CUSTOMER,
    },
  });

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const insets = useSafeAreaInsets();

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  // Shared input style with focus highlight
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

  const contentStyle: ViewStyle = {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: Math.max(insets.bottom, 16) + 24,
  };

  // --- Step navigation ---
  const goNextFromStep1 = async () => {
    setApiError(null);
    // Validate only firstName + lastName before advancing
    const ok = await trigger(['firstName', 'lastName']);
    if (ok) setStep(2);
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setApiError(null);
    const defaultErrorMessage = 'An error occurred while creating your account. Please try again.';

    if (data.password !== data.confirmPassword) {
      setIsLoading(false);
      setApiError('Passwords do not match');
      return;
    }

    try {
      // Prepare payload (omit confirmPassword). Include referralCode if provided.
      const { confirmPassword, referralCode, ...rest } = data as any;
      const payload: RegisterUserRequest = {
        ...(rest as RegisterUserRequest),
      };

      const code = (referralCode || '').trim().toUpperCase();
      if (code.length > 0) {
        payload.referralCode = code;
      }

      const { externalId } = await signUp(payload);
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

  // --- Thin top progress bars (3 discrete bars; step 1 = 1 active, step 2 = 2 active; confirm page will show all 3) ---
  const ProgressBars = () => (
    <HStack className="w-full mb-6" style={{ gap: 6 }}>
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: 6,
            borderRadius: 3,
            backgroundColor: i <= (step === 1 ? 1 : 2) ? BAR_ACTIVE : BAR_BG,
          }}
        />
      ))}
    </HStack>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top + 40}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView contentContainerStyle={contentStyle} keyboardShouldPersistTaps="handled">
            <Box className="flex-1">
              <VStack space="lg">
			  {/* Progress bars */}
			  <ProgressBars />
			  
                <Heading size="xl" className="text-white text-center mb-2">
                  Sign up to Emigro
                </Heading>



                {/* STEP 1 — First & Last name */}
                {step === 1 && (
                  <VStack space="xl">
                    {/* First Name */}
                    <Controller
                      control={control}
                      name="firstName"
                      rules={{ required: 'First name is required' }}
                      render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <>
                          <TextInput
                            placeholder="First Name"
                            placeholderTextColor="#888"
                            value={value}
                            onChangeText={onChange}
                            onFocus={() => setFocusedField('firstName')}
                            onBlur={() => setFocusedField(null)}
                            style={inputStyle('firstName')}
                          />
                          {error?.message ? (
                            <Text className="text-error-500 mt-1 text-center">{error.message}</Text>
                          ) : null}
                        </>
                      )}
                    />

                    {/* Last Name */}
                    <Controller
                      control={control}
                      name="lastName"
                      rules={{ required: 'Last name is required' }}
                      render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <>
                          <TextInput
                            placeholder="Last Name"
                            placeholderTextColor="#888"
                            value={value}
                            onChangeText={onChange}
                            onFocus={() => setFocusedField('lastName')}
                            onBlur={() => setFocusedField(null)}
                            style={inputStyle('lastName')}
                          />
                          {error?.message ? (
                            <Text className="text-error-500 mt-1 text-center">{error.message}</Text>
                          ) : null}
                        </>
                      )}
                    />

                    {/* Next Button */}
                    <Pressable onPressIn={animatePress} onPress={goNextFromStep1}>
                      <Animated.View
                        style={{ transform: [{ scale: scaleAnim }] }}
                        className="bg-primary-500 rounded-full py-4 items-center justify-center mt-4"
                      >
                        <Text className="text-white font-bold text-lg">Continue</Text>
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
                )}

                {/* STEP 2 — Email, Passwords, Referral Code (optional) */}
                {step === 2 && (
                  <VStack space="xl">
                    {/* Email */}
                    <Controller
                      control={control}
                      name="email"
                      rules={{ required: 'Email is required' }}
                      render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <>
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
                          {error?.message ? (
                            <Text className="text-error-500 mt-1 text-center">{error.message}</Text>
                          ) : null}
                        </>
                      )}
                    />

                    {/* Password */}
                    <Controller
                      control={control}
                      name="password"
                      rules={{ required: 'Password is required' }}
                      render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <>
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
                          {error?.message ? (
                            <Text className="text-error-500 mt-1 text-center">{error.message}</Text>
                          ) : null}
                        </>
                      )}
                    />

                    {/* Confirm Password */}
                    <Controller
                      control={control}
                      name="confirmPassword"
                      rules={{
                        required: 'Please confirm your password',
                        validate: (val) => val === getValues('password') || 'Passwords do not match',
                      }}
                      render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <>
                          <TextInput
                            placeholder="Confirm Password"
                            placeholderTextColor="#888"
                            value={value}
                            onChangeText={onChange}
                            secureTextEntry
                            onFocus={() => setFocusedField('confirmPassword')}
                            onBlur={() => setFocusedField(null)}
                            style={inputStyle('confirmPassword')}
                          />
                          {error?.message ? (
                            <Text className="text-error-500 mt-1 text-center">{error.message}</Text>
                          ) : null}
                        </>
                      )}
                    />

                    {/* Referral Code (optional) */}
                    <Controller
                      control={control}
                      name="referralCode"
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          placeholder="Referral code (optional)"
                          placeholderTextColor="#888"
                          autoCapitalize="characters"
                          value={value}
                          onChangeText={(t) => onChange(t?.toUpperCase())}
                          onFocus={() => setFocusedField('referralCode')}
                          onBlur={() => setFocusedField(null)}
                          style={inputStyle('referralCode')}
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

                    {/* Create Account */}
					<Pressable
					  onPressIn={animatePress}
					  onPress={handleSubmit(onSubmit)}
					  disabled={isLoading}
					>
					  <Animated.View
					    style={{ transform: [{ scale: scaleAnim }] }}
					    className={`bg-primary-500 rounded-full py-4 items-center justify-center mt-4 ${
					      isLoading ? 'opacity-50' : ''
					    }`}
					  >
					    {isLoading ? (
					      <HStack className="items-center" style={{ gap: 8 }}>
					        <ActivityIndicator />
					        <Text className="text-white font-bold text-lg">Creating account…</Text>
					      </HStack>
					    ) : (
					      <Text className="text-white font-bold text-lg">Create Account</Text>
					    )}
					  </Animated.View>
					</Pressable>


                    {/* Back to Step 1 */}
                    <Pressable onPress={() => setStep(1)}>
                      <Box className="rounded-full py-3 items-center justify-center mt-3 border border-[#333]">
                        <Text className="text-white">Back</Text>
                      </Box>
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
                )}
              </VStack>
            </Box>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateAccount;
