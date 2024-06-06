import { Box, Heading, Text, VStack } from '@gluestack-ui/themed';
import { Link } from 'expo-router';

import { Sep24TransactionHistory } from '@/components/Sep24TransactionHistory';
import { transactions as transactionsMock } from '@/mocks/api/transactions.json';
import { Sep24Transaction } from '@/services/emigro/types';
import { CryptoAsset } from '@/types/assets';

const Playgorund = () => {
  const asset = CryptoAsset.ARS;
  const transactions = transactionsMock as Sep24Transaction[];

  return (
    <Box flex={1} bg="$white">
      <VStack p="$4" space="4xl">
        <Heading>Welcome to Playground</Heading>

        <Link href="/playground/success">
          <Text>Go to success screen</Text>
        </Link>

        <Sep24TransactionHistory asset={asset} transactions={transactions} />
      </VStack>
    </Box>
  );
};

export default Playgorund;
