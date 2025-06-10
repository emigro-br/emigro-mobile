// src/app/(auth)/payments/confirm/status.tsx

import React, { useEffect, useRef, useState } from 'react';
import { View, Pressable, Animated } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import LottieView from 'lottie-react-native';

import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';

import { api } from '@/services/emigro/api';

const STATUS_MAP = {
  pending: {
    message: 'Starting transaction...',
    secondmessage: 'Please, do not leave this screen',
    lottie: require('@/assets/lotties/loading.json'),
  },
  p001: {
    message: 'Starting transaction...',
    secondmessage: 'Please, do not leave this screen',
    lottie: require('@/assets/lotties/loading.json'),
  },
  p002: {
    message: 'Approving token allowance...',
    secondmessage: 'Please, do not leave this screen',
    lottie: require('@/assets/lotties/loading.json'),
  },
  p003: {
    message: 'Preparing payment...',
    secondmessage: 'Please, do not leave this screen',
    lottie: require('@/assets/lotties/loading.json'),
  },
  p004: {
    message: 'Creating payment...',
    secondmessage: 'Please, do not leave this screen',
    lottie: require('@/assets/lotties/loading.json'),
  },
  p005: {
    message: 'Your payment is on the way!',
    secondmessage: '',
    lottie: require('@/assets/lotties/success.json'),
  },
  s001: {
    message: 'Swaping tokens...',
    secondmessage: 'Please, do not leave this screen',
    lottie: require('@/assets/lotties/loading.json'),
  },
  f001: {
    message: 'Payment complete!',
    secondmessage: '',
    lottie: require('@/assets/lotties/success.json'),
  },
  e001: {
    message: 'Transaction Failed. Please, try again or contact support and inform error code e001. All funds have returned to your wallet.',
    secondmessage: 'Oops...',
    lottie: require('@/assets/lotties/error.json'),
  },
  e002: {
    message: 'Transaction Failed. Please, try again or contact support and inform error code e002. All funds have returned to your wallet.',
    secondmessage: 'Oops...',
    lottie: require('@/assets/lotties/error.json'),
  },
  e003: {
    message: 'Transaction does not yet support this chain or token [error003]. No funds have been moved in your wallet.',
    secondmessage: 'Oops...',
    lottie: require('@/assets/lotties/error.json'),
  },
  e004: {
    message: 'Transaction does not yet support this chain or token [error004]. No funds have been moved in your wallet.',
    secondmessage: 'Oops...',
    lottie: require('@/assets/lotties/error.json'),
  },
  e005: {
    message: 'Pix provider failled to process your transaction. Please contact support and inform [error005]. Funds have returned to your wallet.',
    secondmessage: 'Oops...',
    lottie: require('@/assets/lotties/error.json'),
  },
  e006: {
    message: 'We were unable to make the payment with your selected token. Please try again or use another token for payment.',
    secondmessage: 'Oops...',
    lottie: require('@/assets/lotties/error.json'),
  },
};

const fallbackStatus = {
  message: 'Processing...',
  secondmessage: 'Hang tight — we are currently working on it.',
  lottie: require('@/assets/lotties/loading.json'),
};

const StatusScreen = () => {
  const router = useRouter();
  const { id, message } = useLocalSearchParams<{ id: string; message?: string }>();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const [status, setStatus] = useState<keyof typeof STATUS_MAP>('pending');
  const [transferoTxid, setTransferoTxid] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      if (!id || id === 'error') return;

      try {
        const res = await api().get(`/evm/escrow-evm/${id}`, {
          params: { chainId: 8453 },
        });

        const escrowStatus = res?.data?.escrow?.status;
        const txid = res?.data?.escrow?.transfero_txid;

        if (txid) {
          setTransferoTxid(txid);
        }

        if (escrowStatus && STATUS_MAP[escrowStatus as keyof typeof STATUS_MAP]) {
          setStatus(escrowStatus);
        } else {
          setStatus('pending'); // fallback to pending instead of error for unknown
        }
      } catch (err) {
        console.error('[StatusScreen] ❌ Failed to fetch escrow status:', err);
        setStatus('e001'); // fallback to known error status
      }
    };

    checkStatus();
    const poll = setInterval(checkStatus, 4000);
    return () => clearInterval(poll);
  }, [id]);

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

  const isComplete = ['f001', 'p005', 'e001', 'e002', 'e003', 'e004', 'e005', 'e006'].includes(status);
  const showButton = true;
  
  const isManualError = id === 'error';
  const errorMessage = message || 'Something went wrong with your QR code. Please try another.';

  const finalMessage = isManualError ? errorMessage : statusConfig.message;
  const finalSecondMessage = isManualError ? 'Oops...' : statusConfig.secondmessage;
  const finalLottie = isManualError ? require('@/assets/lotties/error.json') : statusConfig.lottie;


  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Box className="flex-1 bg-background-900 justify-center items-center px-6">
        <VStack space="lg" className="items-center">
		
		<Text size="md" className="text-gray-400 text-center text-2xl">
		{finalMessage}
		</Text>
          <LottieView
            source={finalLottie}
            autoPlay
            loop={!isComplete}
            style={{ width: 180, height: 180 }}
          />



          <Text size="md" className="text-white text-center mt-2">
            {finalSecondMessage}
          </Text>

          {/*{id && (
            <Text className="text-gray-500 mt-3 text-sm text-center">
              <Text className="font-bold text-white">{id}</Text>
            </Text>
          )}*/}

          {isComplete && showButton && (
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

export default StatusScreen;
