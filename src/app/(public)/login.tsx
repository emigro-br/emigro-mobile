// login

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

import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import { backendUrl } from '@/services/emigro/api';
import * as AuthSession from 'expo-auth-session';
import { Image, View } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

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
  
  

  // Set your platform-specific Google client IDs
  const discovery = {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
  };
  
  const clientIds = {
    android: '994789891634-on3kh51cjsdcqndloq6cplqrog63bpah.apps.googleusercontent.com',
    ios: '994789891634-dtrtj3vq4e3q6odr1me9blgv9e0q7qqs.apps.googleusercontent.com',
    web: '994789891634-v0rns44ethbtvev4u8q96sdmbec4kclt.apps.googleusercontent.com',
  };

  // Select clientId per platform
  const clientId = Platform.select({
    android: clientIds.android,
    ios: clientIds.ios,
    default: clientIds.web,
  });

  // Dynamically generate correct redirect URI for each platform
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'emigro',
    native: 'emigro:/oauthredirect',
    useProxy: Platform.select({ web: true, default: false }), // true only on web
  });

  console.log('🔍 Google OAuth redirect URI:', redirectUri);

  const [request, response, promptAsync] = Google.useAuthRequest(
    {
      clientId,
      scopes: ['openid', 'profile', 'email'],
      redirectUri,
    },
    discovery
  );

  const handleOAuthLogin = async (provider: 'google' | 'apple', token: string) => {
    try {
      const res = await fetch(`${backendUrl}/auth/oauth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider, token }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'OAuth login failed');

      await sessionStore.setSession(data.session);
      await sessionStore.fetchProfile();
      router.replace('/');
    } catch (err: any) {
      setApiError(err.message);
    }
  };

  
  
  
  
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
				
				{/* Separator */}
				<View className="flex-row items-center my-4">
				  <View className="flex-1 h-px bg-gray-500" />
				  <Text className="mx-3 text-gray-400 text-sm font-medium">OR LOGIN WITH</Text>
				  <View className="flex-1 h-px bg-gray-500" />
				</View>
				
				{/* Sign in Google */}
				<Pressable
				  onPressIn={animatePress}
				  onPress={() => promptAsync()}
				  disabled={!request || isLoggingIn}
				>
				  <Animated.View
				    style={{ transform: [{ scale: scaleAnim }] }}
				    className={`bg-white rounded-full py-4 items-center justify-center mt-2 ${
				      (!request || isLoggingIn) ? 'opacity-50' : ''
				    }`}
				  >
				    <View className="flex-row items-center space-x-2">
					<Image
					  source={{
					    uri: 'https://www.freepnglogos.com/uploads/google-logo-png/google-logo-png-suite-everything-you-need-know-about-google-newest-0.png',
					  }}
					  className="w-6 h-6 mr-3"
					  resizeMode="contain"
					/>
				      <Text className="text-black font-bold text-lg">
				        {isLoggingIn ? 'Signing in...' : 'Sign in with Google'}
				      </Text>
				    </View>
				  </Animated.View>
				</Pressable>


				{/* {Platform.OS === 'ios' && ( */}
				  <AppleAuthentication.AppleAuthenticationButton
				    buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
				    buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
				    cornerRadius={5}
				    style={{ width: '100%', height: 44, marginTop: 10 }}
				    onPress={async () => {
				      try {
				        const credential = await AppleAuthentication.signInAsync({
				          requestedScopes: [
				            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
				            AppleAuthentication.AppleAuthenticationScope.EMAIL,
				          ],
				        });

				        if (credential.identityToken) {
				          handleOAuthLogin('apple', credential.identityToken);
				        }
				      } catch (error) {
				        console.error(error);
				      }
				    }}
				  />
				{/* )} */}
				
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
