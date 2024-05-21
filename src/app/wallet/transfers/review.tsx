import { useState } from 'react';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Box, Button, ButtonSpinner, ButtonText, Card, HStack, Heading, Text, VStack } from '@gluestack-ui/themed';

import { PinScreen } from '@/components/PinScreen';
import { ErrorDialog } from '@/components/dialogs/ErrorDialog';
import { SuccessDialog } from '@/components/dialogs/SuccessDialog';
import { TransferStackParamList } from '@/navigation/TrasnsferStack';
import { WalletStackParamList } from '@/navigation/WalletStack';
import { paymentStore as bloc } from '@/stores/PaymentStore';
import { securityStore } from '@/stores/SecurityStore';
import { maskWallet } from '@/utils/masks';

type Props = NativeStackScreenProps<WalletStackParamList & TransferStackParamList, 'ReviewTransfer'>;

export const ReviewTransfer = ({ navigation }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPinScreen, setShowPinScreen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { from, to } = bloc.transaction!;
  const destinationWallet = to.wallet;
  const amount = to.value;
  const asset = to.asset;

  const handleConfirmTransaction = async () => {
    setIsLoading(true);
    const defaultError = 'Failed on execute transfer. Please try again.';
    try {
      // Send the transaction
      const result = await bloc.pay();
      if (result.status === 'paid' || result.transactionHash) {
        setIsSuccessDialogOpen(true);
      } else {
        setErrorMessage(defaultError);
      }
    } catch (error) {
      console.warn('Error on pay transfer', error);
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(defaultError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsSuccessDialogOpen(false);
    navigation.navigate('Wallet');
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
      <SuccessDialog isOpen={isSuccessDialogOpen} publicKey={from.wallet} onClose={handleCloseModal} />
      <ErrorDialog isOpen={!!errorMessage} onClose={() => setErrorMessage('')} errorMessage={errorMessage} />
      <Box flex={1}>
        <VStack p="$4" space="lg">
          <Heading size="xl">Review Transfer</Heading>
          <Card size="md" variant="filled" bg="$white">
            <VStack space="md" p="$2">
              <Text>Review transfer details before sending</Text>
              <Row label="You Pay" value={`${amount} ${asset}`} />
              <Row label="Recipient" value={maskWallet(destinationWallet)} />
            </VStack>
          </Card>
          <Button onPress={() => setShowPinScreen(true)} isDisabled={isLoading}>
            {isLoading && <ButtonSpinner mr="$1" />}
            <ButtonText>{isLoading ? 'Sending...' : 'Send'}</ButtonText>
          </Button>
        </VStack>
      </Box>
    </>
  );
};

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  return (
    <HStack space="md" justifyContent="space-between">
      <Text color="$gray">{label}</Text>
      <Text>{value}</Text>
    </HStack>
  );
};

export default ReviewTransfer;
