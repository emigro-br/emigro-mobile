import { useState } from 'react';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Box, Button, ButtonSpinner, ButtonText, Card, HStack, Heading, Text, VStack } from '@gluestack-ui/themed';

import { RootStackParamList } from '@navigation/index';

import { paymentStore as bloc } from '@stores/PaymentStore';

type Props = NativeStackScreenProps<RootStackParamList, 'ReviewTransfer'>;

export const ReviewTransfer = ({ navigation }: Props) => {
  const [isLoading, setIsLoading] = useState(false);

  const { to } = bloc.transaction!;
  const destination = to.wallet;
  const amount = to.value;
  const asset = to.asset;

  const handlePress = async () => {
    setIsLoading(true);
    try {
      // Send the transaction
      const result = await bloc.pay();
      if (result.transactionHash) {
        navigation.navigate('Wallet');
      }
    } catch (error) {
      console.error('An error occurred', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box flex={1}>
      <Heading m="$3">Review Transfer</Heading>
      <Card size="md" variant="filled" m="$3" bg="$white">
        <VStack space="md" p="$2">
          <Text>Review transfer details before sending</Text>
          <Row label="You Pay" value={`${amount} ${asset}`} />
          <Row label="Recipient" value={destination} />
          <Button onPress={() => handlePress()} isDisabled={isLoading}>
            {isLoading && <ButtonSpinner mr="$1" />}
            <ButtonText>{isLoading ? 'Sending...' : 'Send'}</ButtonText>
          </Button>
        </VStack>
      </Card>
    </Box>
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
