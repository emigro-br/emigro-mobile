import React, { useState } from 'react';

import { Box, Button, ButtonText, Card, HStack, Heading, Text, VStack } from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';

import { ErrorModal } from '@/components/modals/ErrorModal';
import { PinScreen } from '@/components/screens/PinScreen';
import { securityStore } from '@/stores/SecurityStore';
import { swapStore as bloc } from '@/stores/SwapStore';

export const DetailsSwap = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPinScreen, setShowPinScreen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!bloc.transaction) {
    router.replace('/');
    return null;
  }

  const { fromAsset, toAsset, fromValue, toValue, rate } = bloc.transaction;
  const estimated = toValue;

  const handleConfirmTransaction = async () => {
    setIsLoading(true);

    try {
      const result = await bloc.swap();
      if (result.status === 'paid') {
        router.replace('/');
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Could not complete the swap, please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (showPinScreen) {
    return (
      <PinScreen
        tagline="Enter your PIN code"
        btnLabel="Confirm"
        autoSubmit
        verifyPin={async (pin) => await securityStore.verifyPin(pin)}
        onPinSuccess={() => {
          setShowPinScreen(false);
          handleConfirmTransaction();
        }}
        onPinFail={(error) => {
          setErrorMessage(error.message);
          setShowPinScreen(false);
        }}
      />
    );
  }

  return (
    <>
      <ErrorModal
        title="Swap failed"
        errorMessage={errorMessage}
        isOpen={!!errorMessage}
        onClose={() => router.back()}
      />
      <Box flex={1}>
        <VStack p="$4" space="lg">
          <Heading>Confirm Swap</Heading>
          <Card size="md" variant="elevated" bg="$white">
            <VStack space="md">
              <Row label="Amount" value={`${fromValue.toFixed(2)} ${fromAsset}`} />
              <Row label="Exchanged" value={`${toValue.toFixed(2)} ${toAsset}`} />
              <Row label="Rate" value={`1 ${toAsset} ≈ ${rate.toFixed(6)} ${fromAsset}`} />
              <Row label="Final receive" value={`${estimated.toFixed(2)} ${toAsset}`} />
            </VStack>
          </Card>
          <Text size="xs">The final amount is estimated and may change.</Text>
          <Button onPress={() => setShowPinScreen(true)} isDisabled={isLoading}>
            <ButtonText>{isLoading ? 'Processing...' : `Swap ${fromAsset} for ${toAsset}`}</ButtonText>
          </Button>
        </VStack>
      </Box>
    </>
  );
};

interface RowProps {
  label: string;
  value: string | number;
}

const Row: React.FC<RowProps> = ({ label, value }) => (
  <HStack justifyContent="space-between">
    <Text size="sm" color="gray">
      {label}
    </Text>
    <Text color="$textLight900">{value}</Text>
  </HStack>
);

export default DetailsSwap;
