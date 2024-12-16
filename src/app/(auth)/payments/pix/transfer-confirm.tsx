import { useRouter } from 'expo-router';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { VStack } from '@/components/ui/vstack';
import { paymentStore } from '@/stores/PaymentStore';

const TransferConfirm = () => {
  const router = useRouter();
  const details = paymentStore.pixTransferDetails;

  if (!details) {
    console.error('No transfer details found in the store. Redirecting...');
    router.replace('/payments/pix/transfer'); // Redirect if no details
    return null;
  }

  const handleConfirm = async () => {
    try {
      console.log('Preparing to confirm transfer with details:', details);

      // Confirming the transfer using the Pix Key logic
      const result = await paymentStore.confirmPixKeyTransfer(details);

      console.log('Transfer result:', result);

      if (result.success) {
        router.push('/payments/confirm/success');
      } else {
        console.error('Transfer failed:', result.error);
        router.push('/payments/confirm/error');
      }
    } catch (err) {
      console.error('Error during transfer confirmation:', err);
      router.push('/payments/confirm/error');
    }
  };

  return (
    <Box className="flex-1 bg-white">
      <VStack space="lg" className="p-4">
        <Heading>Confirm Pix Transfer</Heading>
        <Box>
          <Heading size="sm">Pix Key</Heading>
          <Heading size="md">{details.pixKey}</Heading>
        </Box>
        <Box>
          <Heading size="sm">Amount</Heading>
          <Heading size="md">R$ {details.value.toFixed(2)}</Heading>
        </Box>
        <Button size="lg" onPress={handleConfirm}>
          <ButtonText>Confirm</ButtonText>
        </Button>
      </VStack>
    </Box>
  );
};

export default TransferConfirm;
