import 'react-native-get-random-values';
import React, { useEffect, useRef, useState } from 'react';
import { View, Pressable, Animated } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import LottieView from 'lottie-react-native';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { api } from '@/services/emigro/api';
import { sessionStore } from '@/stores/SessionStore';

const STATUS_MAP = {
  p001: {
    message: 'Starting swap...',
    secondmessage: 'Hang tight — we are currently preparing your swap',
    lottie: require('@/assets/lotties/loading.json'),
  },
  s001: {
    message: 'Your swap is on the way',
    secondmessage: 'Your swap has been successfully sent onchain and you will be notified once the status changes (≈ 30s). You can leave this screen with success.',
    lottie: require('@/assets/lotties/success.json'),
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
  const { walletId, chainId, tokenIn, tokenOut, amountIn, quote } = useLocalSearchParams();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const [status, setStatus] = useState<string>('p001');
  const [txId, setTxId] = useState<string | null>(null);

  const lastQuote = JSON.parse(quote as string);
  const { user } = sessionStore;
  const selectedWallet = user?.wallets?.find(w => w.id === walletId);
  const walletAddress = selectedWallet?.publicAddress;

  useEffect(() => {
    const performSwap = async () => {
      try {
        if (!walletAddress) {
          console.error('[swap status] ❌ Could not resolve walletAddress from walletId:', walletId);
          setStatus('e001');
          return;
        }

		const payload = {
		  fromTokenAddress: tokenIn as string,
		  toTokenAddress: tokenOut as string,
		  amount: amountIn as string,
		  chainId: lastQuote?.chainId,
		  routerType: lastQuote?.routerType,
		  feeTier: lastQuote?.feeTier,
		  estimatedAmount: lastQuote?.rawQuote,
		  minAmountIn: lastQuote?.minAmountIn,
		  slippage: Number(lastQuote?.slippagePercent ?? 0.75),
		  multihop: lastQuote?.multihop ?? false,
		};


        console.log('[swap status] 🔁 Final payload', payload);

        const response = await api().post('/emigroswap/swap', payload);
        const intentId = response.data?.intentId;

        if (!intentId) {
          console.error('[swap status] ❌ No intentId returned from backend');
          setStatus('e001');
          return;
        }

        setTxId(intentId);
        pollForStatus(intentId);
      } catch (err) {
        console.error('[swap status] ❌ Swap failed:', err);
        setStatus('e001');
      }
    };

    performSwap();
  }, [walletId, chainId, tokenIn, tokenOut, amountIn]);

  const pollForStatus = (intentId: string) => {
    const interval = setInterval(async () => {
      try {
        const { data } = await api().get(`/emigroswap/transaction/${intentId}`);
        const backendStatus = data?.status;

        if (backendStatus === 'f001' || backendStatus === 'e001') {
          clearInterval(interval);
          setStatus(backendStatus);
        }
      } catch (err) {
        console.error('[pollForStatus] ❌ Error fetching status:', err);
      }
    }, 3000);
  };

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
  const isComplete = status === 'f001' || status === 'e001' || status === 's001';

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
