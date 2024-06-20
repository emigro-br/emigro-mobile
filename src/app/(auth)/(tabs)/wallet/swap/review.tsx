import React, { useState } from 'react';

import { Box, Button, ButtonText, Card, HStack, Heading, Text, VStack } from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';

import { ErrorModal } from '@/components/modals/ErrorModal';
import { PinScreen } from '@/components/screens/PinScreen';
import { paymentStore as bloc } from '@/stores/PaymentStore';
import { securityStore } from '@/stores/SecurityStore';

export const DetailsSwap = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPinScreen, setShowPinScreen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { from, to, rate, fees } = bloc.transaction!;
  const estimated = to.value - fees;

  const handleConfirmTransaction = async () => {
    setIsLoading(true);

    try {
      const result = await bloc.pay();
      if (result.status === 'paid' || result.transactionHash) {
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
              <Row label="Amount" value={`${from.value.toFixed(2)} ${from.asset}`} />
              <Row label="Exchanged" value={`${to.value.toFixed(2)} ${to.asset}`} />
              <Row label="Rate" value={`1 ${to.asset} ≈ ${rate.toFixed(6)} ${from.asset}`} />
              <Row label="Fees" value={fees} />
              <Row label="Final receive" value={`${estimated.toFixed(2)} ${to.asset}`} />
            </VStack>
          </Card>
          <Text size="xs">The final amount is estimated and may change.</Text>
          <Button onPress={() => setShowPinScreen(true)} isDisabled={isLoading}>
            <ButtonText>{isLoading ? 'Processing...' : `Swap ${from.asset} for ${to.asset}`}</ButtonText>
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
