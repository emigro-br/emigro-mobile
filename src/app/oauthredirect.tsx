// src/app/oauthredirect.tsx

import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
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
  const [hasTried, setHasTried] = useState(false); // For useFocusEffect retry

  const rawParams = useLocalSearchParams();
  const idToken = getParam(rawParams.id);
  const accessToken = getParam(rawParams.access);
  const isNew = getParam(rawParams.isNewUser);

  const handleTokens = ({
    idToken,
    accessToken,
    isNewUser,
    source,
  }: {
    idToken?: string;
    accessToken?: string;
    isNewUser?: boolean;
    source: 'routerParams' | 'deepLink';
  }) => {
    if (!idToken || !accessToken) {
      console.warn(`[OAuthRedirect] [${source}] Missing tokens`, {
        idTokenPresent: !!idToken,
        accessTokenPresent: !!accessToken,
      });
      setError('Login failed: Missing tokens.');
      return;
    }

    console.log(`[OAuthRedirect] ✅ Tokens received from ${source}`, {
      idToken,
      accessToken,
      isNewUser,
    });

    try {
      sessionStore.setSession({ idToken, accessToken });
      sessionStore.fetchProfile();

      router.replace(
        isNewUser ? '/(auth)/onboarding/choose-bank-currency' : '/'
      );
    } catch (e) {
      console.error('[OAuthRedirect] ❌ Failed to set session:', e);
      setError('Login failed: Could not save session.');
    }
  };

  const handleUrl = ({ url }: { url: string }) => {
    console.log('[OAuthRedirect] 🔗 Deep link received:', url);
    const parsed = Linking.parse(url);
    const query = parsed.queryParams || {};

    handleTokens({
      idToken: getParam(query.id),
      accessToken: getParam(query.access),
      isNewUser: getParam(query.isNewUser) === 'true',
      source: 'deepLink',
    });
  };

  const tryRouterParams = () => {
    if (idToken && accessToken) {
      console.log('[OAuthRedirect] ✅ Found tokens in router params');
      handleTokens({
        idToken,
        accessToken,
        isNewUser: isNew === 'true',
        source: 'routerParams',
      });
      return true;
    }
    return false;
  };

  const init = async () => {
    const handled = tryRouterParams();

    if (!handled) {
      console.log('[OAuthRedirect] ❌ No router params, checking getInitialURL...');
      try {
        const url = await Linking.getInitialURL();
        if (url) {
          handleUrl({ url });
        } else {
          console.warn('[OAuthRedirect] getInitialURL() returned null');
          setError('Login failed: No redirect URL received.');
        }
      } catch (err) {
        console.error('[OAuthRedirect] 🔥 Failed to get initial URL:', err);
        setError('Unexpected error while checking redirect URL.');
      }
    }
  };

  useEffect(() => {
    const subscription = Linking.addEventListener('url', handleUrl);

    init();

    const timeout = setTimeout(() => {
      if (!sessionStore.session?.idToken || !sessionStore.session?.accessToken) {
        setError('Login failed: No redirect received within expected time.');
      }
    }, 10000);

    return () => {
      subscription.remove();
      clearTimeout(timeout);
    };
  }, []);

  useFocusEffect(() => {
    if (!hasTried) {
      setHasTried(true);
      init(); // Retry when screen is focused
    }
  });

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
