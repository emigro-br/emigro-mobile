import { Box, Button, ButtonText, Card, HStack, Heading, Text, VStack } from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';

import { paymentStore as bloc } from '@/stores/PaymentStore';
import { maskWallet } from '@/utils/masks';

export const ReviewTransfer = () => {
  const router = useRouter();
  const { to } = bloc.transaction!;
  const destinationWallet = to.wallet;
  const amount = to.value;
  const asset = to.asset;

  return (
    <>
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
          <Button onPress={() => router.push('./confirm')}>
            <ButtonText>Send</ButtonText>
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
