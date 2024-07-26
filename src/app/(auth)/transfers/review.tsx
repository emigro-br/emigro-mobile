import { Stack, useRouter } from 'expo-router';

import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { transferStore } from '@/stores/TransferStore';
import { maskWallet } from '@/utils/masks';

export const ReviewTransfer = () => {
  const router = useRouter();
  const { amount, asset, destinationAddress } = transferStore.transaction!;

  return (
    <>
      <Stack.Screen options={{ title: 'Review Transfer' }} />
      <Box className="flex-1">
        <VStack space="lg" className="p-4">
          <Heading size="xl">Review Transfer</Heading>
          <Card size="md" variant="filled" className="bg-white">
            <VStack space="md" className="p-2">
              <Text>Review transfer details before sending</Text>
              <Row label="You Pay" value={`${amount} ${asset}`} />
              <Row label="Recipient" value={maskWallet(destinationAddress)} />
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
    <HStack space="md" className="justify-between">
      <Text className="text-gray">{label}</Text>
      <Text>{value}</Text>
    </HStack>
  );
};

export default ReviewTransfer;
