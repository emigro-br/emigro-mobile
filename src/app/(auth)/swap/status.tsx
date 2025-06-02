// src/app/(auth)/swap/status.tsx

import React, { useEffect, useRef, useState } from 'react';
import { View, Pressable, Animated } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import LottieView from 'lottie-react-native';

import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { api } from '@/services/emigro/api';

const STATUS_MAP = {
  pending: {
    message: 'Starting swap...',
    secondmessage: 'Hang tight — we are currently preparing your swap',
    lottie: require('@/assets/lotties/loading.json'),
  },
  s001: {
    message: 'Swapping tokens...',
    secondmessage: 'Hang tight — your swap is being executed. Please keep your application open while we complete your operation (estimated less than 30 seconds)',
    lottie: require('@/assets/lotties/loading.json'),
  },
  f001: {
    message: 'Swap complete!',
    secondmessage: 'Your tokens have been swapped successfully.',
    lottie: require('@/assets/lotties/success.json'),
  },
  e001: {
    message: 'Swap failed',
    secondmessage: 'Please try again or contact support.',
    lottie: require('@/assets/lotties/error.json'),
  },
};

const fallbackStatus = {
  message: 'Processing...',
  secondmessage: 'Hang tight — we are currently working on it.',
  lottie: require('@/assets/lotties/loading.json'),
};

const SwapStatusScreen = () => {
  const router = useRouter();
  const { walletId, chainId, tokenIn, tokenOut, amountIn } = useLocalSearchParams();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const [status, setStatus] = useState<'pending' | 's001' | 'f001' | 'e001'>('pending');
  const [txId, setTxId] = useState<string | null>(null);

  useEffect(() => {
    const performSwap = async () => {
      try {
        setStatus('s001');

        const payload = {
          walletId: walletId as string,
          chainId: chainId as string,
          tokenIn: tokenIn as string,
          tokenOut: tokenOut as string,
          amountIn: amountIn as string,
        };

        console.log('[swap status] 🔁 swap payload', payload);

		const response = await api().post('/evm/swap-evm', payload);
		console.log('[swap status] 🧾 Swap response', response.data);
		const txStatus = response.data?.data?.status;
		const txId = response.data?.data?.id;

		setTxId(txId);

		if (txStatus === 'CONFIRMED') {
		  setStatus('f001');
		} else {
		  console.warn('[swap status] ⚠️ Unexpected transaction status:', txStatus);
		  setStatus('e001');
		}
      } catch (err) {
        console.error('[swap status] ❌ Swap failed:', err);
        setStatus('e001');
      }
    };

    performSwap();
  }, [walletId, chainId, tokenIn, tokenOut, amountIn]);

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const handleGoHome = () => {
    router.replace('/');
  };

  const statusConfig = STATUS_MAP[status] || fallbackStatus;
  const isComplete = status === 'f001' || status === 'e001';

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Box className="flex-1 bg-background-900 justify-center items-center px-6">
        <VStack space="lg" className="items-center">
          <Text size="md" className="text-gray-400 text-center text-2xl">
            {statusConfig.message}
          </Text>

          <LottieView
            source={statusConfig.lottie}
            autoPlay
            loop={!isComplete}
            style={{ width: 180, height: 180 }}
          />

          <Text size="md" className="text-white text-center mt-2">
            {statusConfig.secondmessage}
          </Text>



          {isComplete && (
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
    </>
  );
};

export default SwapStatusScreen;
