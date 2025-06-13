import React from 'react';
import { useRouter } from 'expo-router';
import { ImageBackground, StyleSheet } from 'react-native';

import emigroLogo from '@/assets/images/emigro-logo.png';
import backgroundImage from '@/assets/images/background.png';

import { Box } from '@/components/ui/box';
import { Button, ButtonGroup, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';

import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { backendUrl } from '@/services/emigro/api';
import * as AuthSession from 'expo-auth-session';
import { View, Animated, Platform, Pressable } from 'react-native';
import { useRef, useState } from 'react';
import googleLogo from '@/assets/images/google-logo.png';

WebBrowser.maybeCompleteAuthSession();

export const Welcome = () => {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const clientId = '3sbvb7isvqul6dlfbhakrqgei8';
  const nativeRedirectUri = 'com.googleusercontent.apps.994789891634-on3kh51cjsdcqndloq6cplqrog63bpah:/oauthredirect';
  const redirectUri = AuthSession.makeRedirectUri({
    native: nativeRedirectUri,
    useProxy: false,
  });

  const loginWithGoogle = async () => {
    setIsLoggingIn(true);
    try {
      const authUrl = `https://us-east-15omuq0klj.auth.us-east-1.amazoncognito.com/oauth2/authorize` +
        `?client_id=${clientId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code` +
        `&scope=email%20openid` +
        `&identity_provider=Google` +
		`&prompt=select_account`
		;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type === 'success' && result.url) {
        const parsed = Linking.parse(result.url);
        const code = parsed.queryParams?.code;

        if (code) {
          const response = await fetch(`${backendUrl}/auth/oauth/callback?code=${code}`, {
            method: 'GET',
          });

          const redirectUrl = await response.text();
          Linking.openURL(redirectUrl);
        } else {
          setApiError('Authorization code not found.');
        }
      } else {
        setApiError('Login canceled or failed.');
      }
    } catch (e) {
      console.error('OAuth login error', e);
      setApiError('Something went wrong during login.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.background} resizeMode="cover">
      <Box className="flex-1 px-4 justify-between py-20">
        <Center className="mt-20">
          <Image source={emigroLogo} alt="Emigro logo" className="h-20 w-80 mb-10" />
          <Text size="2xl" bold className="text-white mb-2 text-center">
            Borderless finance for nomads
          </Text>
        </Center>

        <ButtonGroup space="md" flexDirection="column">
          <Button
            onPress={() => router.push('/login')}
            variant="solid"
            size="xl"
            className="rounded-full bg-[#890000] py-4 h-14"
          >
            <ButtonText className="text-white">Login</ButtonText>
          </Button>

          <Button
            onPress={() => router.push('/signup')}
            variant="outline"
            size="xl"
            className="rounded-full border-white py-4 h-14"
          >
            <ButtonText className="text-white">Create Account</ButtonText>
          </Button>

          <View className="flex-row items-center my-4">
            <View className="flex-1 h-px bg-white" />
            <Text className="mx-3 text-white text-sm font-medium">OR LOGIN WITH</Text>
            <View className="flex-1 h-px bg-white" />
          </View>

          <Pressable
            onPressIn={animatePress}
            onPress={loginWithGoogle}
            disabled={isLoggingIn}
          >
            <Animated.View
              style={{ transform: [{ scale: scaleAnim }] }}
              className={`bg-white rounded-full py-4 items-center justify-center mt-2 ${isLoggingIn ? 'opacity-50' : ''}`}
            >
              <View className="flex-row items-center space-x-2">
                <Image source={googleLogo} className="w-5 h-5 mr-3" resizeMode="contain" />
                <Text className="text-black font-semibold text-[19px]" style={{ letterSpacing: 0.5 }}>
                  {isLoggingIn ? 'Signing in...' : 'Sign in with Google'}
                </Text>
              </View>
            </Animated.View>
          </Pressable>

		{/*{Platform.OS === 'ios' && (
		  <View style={{ marginTop: 10, borderRadius: 999, overflow: 'hidden' }}>
		    <AppleAuthentication.AppleAuthenticationButton
		      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
		      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE} // try WHITE for better match
		      cornerRadius={999} // mimic full-rounded
		      style={{ width: '100%', height: 56 }} // match height with Google button
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
		  </View>
		)}*/}

        </ButtonGroup>
      </Box>
    </ImageBackground>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});