import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { CryptoOrFiat } from '@/types/assets';
import { symbolFor } from '@/utils/assets';

type Props = {
  total: number;
  cryptoOrFiat: CryptoOrFiat;
  hide?: boolean;
};

export const TotalBalance = ({ total, cryptoOrFiat, hide = false }: Props) => {
  return (
    <VStack className="min-w-44" testID="total-balance">
      <Text className="text-white font-bold">Total Balance</Text>
      <HStack className="items-center">
        <Text size="3xl" className="text-white font-bold">
          {hide ? '****' : symbolFor(cryptoOrFiat, total)}
        </Text>
      </HStack>
    </VStack>
  );
};
