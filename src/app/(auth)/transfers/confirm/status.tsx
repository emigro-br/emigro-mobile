// src/app/(auth)/transfers/confirm/status.tsx

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import LottieView from 'lottie-react-native';
import { Pressable, Animated } from 'react-native';

const STATUS_CONFIG = {
  loading: {
    title: 'Processing Transfer...',
    subtitle: 'Hang tight while your transfer completes.',
    lottie: require('@/assets/lotties/loading.json'),
  },
  success: {
    title: 'Transfer Complete!',
    subtitle: 'Your tokens have been sent successfully.',
    lottie: require('@/assets/lotties/success.json'),
  },
  error: {
    title: 'Transfer Failed',
    subtitle: 'Something went wrong. Please try again or contact support.',
    lottie: require('@/assets/lotties/error.json'),
  },
};

const StatusScreen = () => {
  const router = useRouter();
  const { success, error } = useLocalSearchParams<{ success?: string; error?: string }>();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (error) {
      setStatus('error');
    } else if (success) {
      setStatus('success');
    } else {
      // fallback to loading if status unknown
      setStatus('loading');
    }
  }, [success, error]);

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const handleReturn = () => {
    router.replace('/');
  };

  const { title, subtitle, lottie } = STATUS_CONFIG[status];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Box className="flex-1 bg-background-900 justify-center items-center px-6">
        <VStack space="lg" className="items-center">
          <Text size="xl" className="text-white font-bold text-center">
            {title}
          </Text>

          <LottieView
            source={lottie}
            autoPlay
            loop={status === 'loading'}
            style={{ width: 180, height: 180 }}
          />

          <Text size="md" className="text-white text-center">
            {subtitle}
          </Text>

          {status !== 'loading' && (
            <Pressable onPressIn={animatePress} onPress={handleReturn}>
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
    </>
  );
};

export default StatusScreen;
