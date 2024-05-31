import { Box, Heading, VStack } from '@gluestack-ui/themed';

import { TransactionHistory } from '@/components/TransactionHistory';
import { transactions as transactionsMock } from '@/mocks/api/transactions.json';
import { Sep24Transaction } from '@/services/emigro/types';
import { CryptoAsset } from '@/types/assets';

const Playgorund = () => {
  const asset = CryptoAsset.ARS;
  const transactions = transactionsMock as Sep24Transaction[];

  return (
    <Box flex={1} bg="$white">
      <VStack p="$4">
        <Heading>Welcome to Playground</Heading>
        <TransactionHistory asset={asset} transactions={transactions} />
      </VStack>
    </Box>
  );
};

export default Playgorund;
