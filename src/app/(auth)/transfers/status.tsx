// src/app/(auth)/transfers/status.tsx

import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';

import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { api } from '@/services/emigro/api';

const STATUS_MAP = {
  s001: {
    message: 'Swapping tokens...',
    secondmessage: 'Hold tight while your tokens are being exchanged.',
    lottie: require('@/assets/lotties/loading.json'),
  },
  success: {
    message: 'Swap complete!',
    secondmessage: 'You may now close this window.',
    lottie: require('@/assets/lotties/success.json'),
  },
  error: {
    message: 'Swap failed!',
    secondmessage: 'Please try again or contact support.',
    lottie: require('@/assets/lotties/error.json'),
  },
};

const fallbackStatus = STATUS_MAP.s001;

const SwapStatusScreen = () => {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const {
    walletId,
    chainId,
    tokenIn,
    tokenOut,
    amountIn,
    amountOut,
  } = useLocalSearchParams<{
    walletId: string;
    chainId: string;
    tokenIn: string;
    tokenOut: string;
    amountIn?: string;
    amountOut?: string;
  }>();

  const [statusKey, setStatusKey] = useState<keyof typeof STATUS_MAP>('s001');
  const [txId, setTxId] = useState<string | null>(null);

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const handleGoHome = () => {
    router.replace('/');
  };

  useEffect(() => {
    const executeSwap = async () => {
      setStatusKey('s001');
      try {
        const payload = {
          walletId,
          chainId: Number(chainId),
          tokenIn,
          tokenOut,
          amountIn,
          amountOut,
        };

        const res = await api().post('/evm/swap-evm', payload);
        const transactionId = res.data?.transactionId;

        setTxId(transactionId);
        setStatusKey('success');
      } catch (err) {
        console.error('[SwapStatus] Swap failed:', err);
        setStatusKey('error');
      }
    };

    executeSwap();
  }, [walletId, chainId, tokenIn, tokenOut, amountIn, amountOut]);

  const config = STATUS_MAP[statusKey] || fallbackStatus;
  const isComplete = statusKey === 'success' || statusKey === 'error';

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Box className="flex-1 bg-background-900 justify-center items-center px-6">
        <VStack space="lg" className="items-center">
          <Text size="md" className="text-gray-400 text-center text-2xl">
            {config.message}
          </Text>

          <LottieView
            source={config.lottie}
            autoPlay
            loop={!isComplete}
            style={{ width: 180, height: 180 }}
          />

          <Text size="md" className="text-white text-center mt-2">
            {config.secondmessage}
          </Text>

          {txId && (
            <Text className="text-gray-500 mt-3 text-sm text-center">
              <Text className="font-bold text-white">{txId}</Text>
            </Text>
          )}

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
