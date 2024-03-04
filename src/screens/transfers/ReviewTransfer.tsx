import { useState } from 'react';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Box, Button, ButtonSpinner, ButtonText, Card, HStack, Heading, Text, VStack } from '@gluestack-ui/themed';

import { ErrorDialog } from '@components/dialogs/ErrorDialog';
import { SuccessDialog } from '@components/dialogs/SuccessDialog';

import { RootStackParamList } from '@navigation/RootStack';

import { paymentStore as bloc } from '@stores/PaymentStore';

import { maskWallet } from '@utils/masks';

type Props = NativeStackScreenProps<RootStackParamList, 'ReviewTransfer'>;

export const ReviewTransfer = ({ navigation }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { from, to } = bloc.transaction!;
  const destinationWallet = to.wallet;
  const amount = to.value;
  const asset = to.asset;

  const handlePress = async () => {
    setIsLoading(true);
    const defaultError = 'Failed on execute transfer. Please try again.';
    try {
      // Send the transaction
      const result = await bloc.pay();
      if (result.transactionHash) {
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
          <Button onPress={() => handlePress()} isDisabled={isLoading}>
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
