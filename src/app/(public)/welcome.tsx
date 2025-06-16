import React, { useRef, useState } from 'react';
import { Animated, ImageBackground, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import * as AuthSession from 'expo-auth-session';

import emigroLogo from '@/assets/images/emigro-logo.png';
import backgroundImage from '@/assets/images/background.png';
import googleLogo from '@/assets/images/google-logo.png';

import { Box } from '@/components/ui/box';
import { Button, ButtonGroup, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';

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
    setApiError(null);
    setIsLoggingIn(true);

    try {
      const authUrl =
        `https://auth.emigro.co/oauth2/authorize` +
        `?client_id=${clientId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code` +
        `&scope=openid%20email%20profile%20aws.cognito.signin.user.admin` +
        `&identity_provider=Google` +
        `&prompt=consent` +
        `&access_type=offline`;

      console.log('[Login] 🔗 Opening auth URL:', authUrl);
      console.log('[Login] 📥 Expecting redirect to:', redirectUri);

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
      console.log('[Login] 🔄 WebBrowser result:', result);

      if (result.type === 'success' && result.url) {
        const parsed = Linking.parse(result.url);
        console.log('[Login] ✅ Parsed deep link:', parsed);

        const idToken = parsed.queryParams?.id;
        const accessToken = parsed.queryParams?.access;
        const isNewUser = parsed.queryParams?.isNewUser;

        if (!idToken || !accessToken) {
          setApiError('Missing tokens in redirect URL.');
          console.warn('[Login] ❌ Missing tokens:', parsed.queryParams);
          return;
        }

        router.replace(
          `/oauthredirect?id=${encodeURIComponent(idToken)}&access=${encodeURIComponent(accessToken)}&isNewUser=${isNewUser}`
        );
      } else {
        console.warn('[Login] ❌ Auth session cancelled or failed:', result);
        setApiError('Login canceled or failed.');
      }
    } catch (e) {
      console.error('[Login] ❌ Unexpected error:', e);
      setApiError(e instanceof Error ? e.message : 'Unknown login error occurred.');
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
            className="rounded-full bg-[#890000] py-4 h-16"
          >
            <ButtonText className="text-white">Login</ButtonText>
          </Button>

          <Button
            onPress={() => router.push('/signup')}
            variant="outline"
            size="xl"
            className="rounded-full border-white py-4 h-16"
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

          {apiError && (
            <Text className="text-white text-center mt-4" size="sm">
              {apiError}
            </Text>
          )}
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
