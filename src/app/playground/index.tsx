import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { Box } from "@/components/ui/box";
import { Link } from 'expo-router';

import { Sep24TransactionHistory } from '@/components/Sep24TransactionHistory';
import { transactions as transactionsMock } from '@/mocks/api/transactions.json';
import { Sep24Transaction } from '@/services/emigro/types';
import { CryptoAsset } from '@/types/assets';

const Playgorund = () => {
  const asset = CryptoAsset.ARS;
  const transactions = transactionsMock as Sep24Transaction[];

  return (
    <Box className="flex-1 bg-white">
      <VStack space="4xl" className="p-4">
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
