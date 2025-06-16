import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import LottieView from 'lottie-react-native';

import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { sessionStore } from '@/stores/SessionStore';

const getParam = (p: string | string[] | undefined): string | undefined =>
  typeof p === 'string' ? p : Array.isArray(p) ? p[0] : undefined;

const OAuthRedirect = () => {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [error, setError] = useState<string | null>(null);

  const rawParams = useLocalSearchParams();
  const idToken = getParam(rawParams.id);
  const accessToken = getParam(rawParams.access);
  const isNew = getParam(rawParams.isNewUser);

  useEffect(() => {
    const processTokens = async () => {
      if (!idToken || !accessToken) {
        console.warn('[OAuthRedirect] ❌ Missing tokens in router params', {
          idTokenPresent: !!idToken,
          accessTokenPresent: !!accessToken,
        });

        try {
          const initialUrl = await Linking.getInitialURL();
          if (initialUrl) {
            console.log('[OAuthRedirect] 🌐 Got initial deep link:', initialUrl);
            const parsed = Linking.parse(initialUrl);
            const id = getParam(parsed.queryParams?.id);
            const access = getParam(parsed.queryParams?.access);
            const isNewUser = getParam(parsed.queryParams?.isNewUser) === 'true';

            if (id && access) {
              sessionStore.setSession({ idToken: id, accessToken: access });
              sessionStore.fetchProfile();
              router.replace(isNewUser ? '/(auth)/onboarding/choose-bank-currency' : '/');
              return;
            }
          }

          setError('Login failed: Missing tokens.');
        } catch (e) {
          console.error('[OAuthRedirect] 🔥 Failed to parse fallback URL:', e);
          setError('Login failed: Could not process redirect.');
        }

        return;
      }

      console.log('[OAuthRedirect] ✅ Tokens from router params', {
        idToken,
        accessToken,
        isNew,
      });

      try {
        sessionStore.setSession({ idToken, accessToken });
        sessionStore.fetchProfile();
        router.replace(isNew === 'true' ? '/(auth)/onboarding/choose-bank-currency' : '/');
      } catch (e) {
        console.error('[OAuthRedirect] ❌ Failed to set session:', e);
        setError('Login failed: Could not save session.');
      }
    };

    processTokens();
  }, []);

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const handleGoHome = () => {
    router.replace('/');
  };

  const lottieSource = error
    ? require('@/assets/lotties/error.json')
    : require('@/assets/lotties/loading.json');

  return (
    <Box className="flex-1 bg-background-900 justify-center items-center px-6">
      <VStack space="lg" className="items-center">
        <Text size="xl" className="text-gray-300 text-center">
          {error ? 'Login Error' : 'Completing Login...'}
        </Text>

        <LottieView
          key={error ? 'error' : 'loading'}
          source={lottieSource}
          autoPlay
          loop={!error}
          style={{ width: 180, height: 180 }}
        />

        <Text size="md" className="text-white text-center mt-2">
          {error
            ? error
            : 'Please wait while we complete your authentication.'}
        </Text>

        {error && (
          <Pressable onPressIn={animatePress} onPress={handleGoHome}>
            <Animated.View
              style={{ transform: [{ scale: scaleAnim }] }}
              className="bg-primary-500 rounded-full py-4 px-12 items-center justify-center mt-6"
            >
              <Text className="text-white font-bold text-lg">Return</Text>
            </Animated.View>
          </Pressable>
        )}
      </VStack>
    </Box>
  );
};

export default OAuthRedirect;
