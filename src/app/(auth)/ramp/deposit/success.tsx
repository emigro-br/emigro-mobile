// /src/app/ramp/deposit/success.tsx

import React from 'react';
import { View, Pressable, Animated } from 'react-native';
import LottieView from 'lottie-react-native';
import { useRouter } from 'expo-router';

import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';

import { Stack } from 'expo-router';

const SuccessScreen = () => {
  const router = useRouter();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const handleGoHome = () => {
    router.replace('/');
  };

  return (
	<>
	<Stack.Screen options={{ headerShown: false }} />
    <Box className="flex-1 bg-background-900 justify-center items-center px-6">
      <VStack space="lg" className="items-center">
        {/* ✅ Lottie Animation */}
        <LottieView
          source={require('@/assets/lotties/success.json')}
          autoPlay
          loop={false}
          style={{ width: 180, height: 180 }}
        />

        <Heading size="xl" className="text-white text-center mt-4">
          Payment Confirmed
        </Heading>

        <Text size="md" className="text-gray-400 text-center">
          Your payment was successful. Your tokens will appear in your wallet shortly.
        </Text>

        {/* ✅ Return Button */}
        <Pressable onPressIn={animatePress} onPress={handleGoHome}>
          <Animated.View
            style={{ transform: [{ scale: scaleAnim }] }}
            className="bg-primary-500 rounded-full py-4 px-12 items-center justify-center mt-6"
          >
            <Text className="text-white font-bold text-lg">Return to Home</Text>
          </Animated.View>
        </Pressable>
      </VStack>
    </Box>
	</>
  );
};

export default SuccessScreen;
