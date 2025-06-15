import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import LottieView from 'lottie-react-native';

import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { sessionStore } from '@/stores/SessionStore';

const OAuthRedirect = () => {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { id, access, isNewUser } = useLocalSearchParams();

  useEffect(() => {
    let handled = false;

    const handleTokens = ({
      idToken,
      accessToken,
      isNewUser,
      source,
    }: {
      idToken?: string;
      accessToken?: string;
      isNewUser?: boolean;
      source: string;
    }) => {
      if (!idToken && !accessToken) {
        console.warn(`[OAuthRedirect] [${source}] Missing both tokens`);
        setError('Authentication failed. Both tokens are missing.');
        return;
      }

      if (!idToken) {
        console.warn(`[OAuthRedirect] [${source}] Missing id token`);
        setError('Authentication failed. ID token is missing.');
        return;
      }

      if (!accessToken) {
        console.warn(`[OAuthRedirect] [${source}] Missing access token`);
        setError('Authentication failed. Access token is missing.');
        return;
      }

      console.log(`[OAuthRedirect] [${source}] Tokens received`, {
        idToken,
        accessToken,
        isNewUser,
      });

      handled = true;

      sessionStore.setSession({ idToken, accessToken });
      sessionStore.fetchProfile();

      router.replace(
        isNewUser === 'true' ? '/(auth)/onboarding/choose-bank-currency' : '/'
      );
    };

    const tryLocalParams = () => {
      if (id || access) {
        console.log('[OAuthRedirect] Found tokens in local router params');
        handleTokens({
          idToken: id as string,
          accessToken: access as string,
          isNewUser: isNew === 'true',
          source: 'routerParams',
        });
        return true;
      }
      return false;
    };

    const handleUrl = ({ url }: { url: string }) => {
      console.log('[OAuthRedirect] Handling deep link URL:', url);
      if (!url) {
        console.warn('[OAuthRedirect] URL was empty');
        setError('Deep link handler received an empty URL.');
        return;
      }

      const parsed = Linking.parse(url);
      const query = parsed.queryParams || {};

      handleTokens({
        idToken: query.id as string,
        accessToken: query.access as string,
        isNewUser: query.new === 'true',
        source: 'deepLink',
      });
    };

    const init = async () => {
      if (tryLocalParams()) return;

      console.log('[OAuthRedirect] No router params found, falling back to getInitialURL()');

      try {
        const url = await Linking.getInitialURL();
        if (url) {
          handleUrl({ url });
        } else {
          console.warn('[OAuthRedirect] getInitialURL() returned null');
        }
      } catch (err) {
        console.error('[OAuthRedirect] Failed to get initial URL:', err);
        setError('Unexpected error while checking redirect URL.');
      }
    };

    const subscription = Linking.addEventListener('url', handleUrl);

    init();

    const timeout = setTimeout(() => {
      if (!handled) {
        if (sessionStore.session?.idToken && sessionStore.session?.accessToken) {
          console.warn('[OAuthRedirect] Timeout reached, but session exists. Redirecting.');
          router.replace('/');
        } else {
          console.error('[OAuthRedirect] Timeout: No valid redirect and no session');
          setError('Login failed. No redirect received within expected time.');
        }
        setLoading(false);
      }
    }, 1500);

    return () => {
      subscription.remove();
      clearTimeout(timeout);
    };
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
