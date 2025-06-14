import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import LottieView from 'lottie-react-native';
import { Animated, Pressable } from 'react-native';

import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { sessionStore } from '@/stores/SessionStore';

const OAuthRedirect = () => {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let handled = false;

    const handleUrl = ({ url }: { url: string }) => {
      console.log('[OAuthRedirect] Handling URL:', url);

      if (!url) {
        setError('Deep link handler received empty URL.');
        setLoading(false);
        return;
      }

      const parsed = Linking.parse(url);
      console.log('[OAuthRedirect] Parsed URL:', parsed);

      const query = parsed.queryParams || {};
      const idToken = query.id as string;
      const accessToken = query.access as string;
      const isNewUser = query.new === 'true';

      if (!query) {
        console.warn('[OAuthRedirect] Missing query parameters.');
        setError('Authentication failed. No query parameters found in redirect URL.');
      } else if (!idToken && !accessToken) {
        console.warn('[OAuthRedirect] Missing both id and access tokens.');
        setError('Authentication failed. Both tokens are missing from the URL.');
      } else if (!idToken) {
        console.warn('[OAuthRedirect] Missing id token.');
        setError('Authentication failed. ID token is missing.');
      } else if (!accessToken) {
        console.warn('[OAuthRedirect] Missing access token.');
        setError('Authentication failed. Access token is missing.');
      } else {
        console.log('[OAuthRedirect] Tokens:', { idToken, accessToken, isNewUser });
        handled = true;

        sessionStore.setSession({ idToken, accessToken });
        sessionStore.fetchProfile();

        router.replace(
          isNewUser ? '/(auth)/onboarding/choose-bank-currency' : '/'
        );
      }

      setLoading(false);
    };

    const subscription = Linking.addEventListener('url', handleUrl);

    (async () => {
      const url = await Linking.getInitialURL();
      if (url) {
        handleUrl({ url });
      } else {
        console.warn('[OAuthRedirect] No initial URL from getInitialURL()');
      }
    })();

    const timeout = setTimeout(() => {
      if (!handled) {
        if (sessionStore.session?.idToken && sessionStore.session?.accessToken) {
          console.warn('[OAuthRedirect] No URL received, but session is already set. Redirecting to home.');
          router.replace('/');
        } else {
          console.warn('[OAuthRedirect] Timeout: No deep link and no session.');
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
      Animated.timing(scaleAnim, {
        toValue: 0.96,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
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
