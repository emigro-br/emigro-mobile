import React, { useState } from 'react';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Box, Button, ButtonText, Card, HStack, Heading, Text, VStack } from '@gluestack-ui/themed';

import { ErrorModal } from '@components/modals/ErrorModal';

import { TabNavParamList } from '@navigation/MainApp';
import { SwapStackParamList } from '@navigation/SwapStack';

import { PIN } from '@screens/PIN';

import { paymentStore as bloc } from '@stores/PaymentStore';
import { sessionStore } from '@stores/SessionStore';

interface DetailsSwapProps {
  navigation: NativeStackNavigationProp<TabNavParamList & SwapStackParamList, 'SwapReview'>;
}

export const DetailsSwap = ({ navigation }: DetailsSwapProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPinScreen, setShowPinScreen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { from, to, rate, fees } = bloc.transaction!;
  const toValue = from.value * rate;
  const estimated = toValue - fees;

  const handleConfirmTransaction = async () => {
    setShowPinScreen(false);
    setIsLoading(true);

    try {
      const result = await bloc.pay();
      if (result.transactionHash) {
        navigation.navigate('WalletTab');
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('An error occurred, please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (showPinScreen) {
    return (
      <PIN
        title="Enter your PIN code"
        btnLabel="Confirm"
        verifyPin={async (pin) => await sessionStore.verifyPin(pin)}
        onPinSuccess={handleConfirmTransaction}
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
        onClose={() => navigation.goBack()}
      />
      <Box flex={1}>
        <VStack p="$4" space="lg">
          <Heading>Confirm Swap</Heading>
          <Card size="md" variant="elevated" bg="$white">
            <VStack space="md">
              <Row label="Amount" value={`${from.value.toFixed(2)} ${from.asset}`} />
              <Row label="Rate" value={`1 ${from.asset} ≈ ${rate.toFixed(6)} ${to.asset}`} />
              <Row label="Exchanged" value={`${toValue.toFixed(2)} ${to.asset}`} />
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
