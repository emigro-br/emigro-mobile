import React, { useRef, useEffect } from 'react';
import { Pressable, Animated, Linking, Platform } from 'react-native';
import LottieView from 'lottie-react-native';
import { Stack } from 'expo-router';

import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';

type Props = {
  message: string;
  storeUrl?: string; // ✅ receives the URL from API
};

const VersionLockScreen = ({ message, storeUrl }: Props) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const lottieRef = useRef<LottieView>(null);

  const LOOP_DELAY_MS = 2000; // ⏱ Delay before restarting animation

  useEffect(() => {
    lottieRef.current?.play();
  }, []);

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const handleUpdate = async () => {
    try {
      if (storeUrl) {
        console.log('[VersionLock] Opening store URL:', storeUrl);
        await Linking.openURL(storeUrl);
      } else {
        const fallbackUrl =
          Platform.OS === 'ios'
            ? 'https://apps.apple.com/'
            : 'https://play.google.com/store/apps';
        console.warn('[VersionLock] No storeUrl from API, using fallback');
        await Linking.openURL(fallbackUrl);
      }
    } catch (err) {
      console.error('[VersionLock] Failed to open store URL:', err);
    }
  };

  const handleAnimationFinish = () => {
    setTimeout(() => {
      lottieRef.current?.play();
    }, LOOP_DELAY_MS);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Box className="flex-1 bg-background-900 justify-center items-center px-6">
        <VStack space="lg" className="items-center">
          <LottieView
            ref={lottieRef}
            source={require('@/assets/lotties/update.json')}
            autoPlay={false}
            loop={false}
            onAnimationFinish={handleAnimationFinish}
            style={{ width: 200, height: 200 }}
          />
          <Text size="xl" className="text-white font-bold text-center">
            Update Required
          </Text>
          <Text size="md" className="text-gray-300 text-center px-4">
            {message || 'Please update your app to continue.'}
          </Text>
          <Pressable onPressIn={animatePress} onPress={handleUpdate}>
            <Animated.View
              style={{ transform: [{ scale: scaleAnim }] }}
              className="bg-primary-500 rounded-full py-4 px-12 items-center justify-center mt-6"
            >
              <Text className="text-white font-bold text-lg">Update Now</Text>
            </Animated.View>
          </Pressable>
        </VStack>
      </Box>
    </>
  );
};

export default VersionLockScreen;
