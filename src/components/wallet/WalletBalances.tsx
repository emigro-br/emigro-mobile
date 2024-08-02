import { useRouter } from 'expo-router';

import { Button, ButtonIcon } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { AddIcon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Balance } from '@/services/emigro/types';
import { CryptoAsset } from '@/types/assets';
import { symbolFor } from '@/utils/assets';

import { AssetListTile } from '../AssetListTile';

interface Props {
  userBalance: Balance[];
}

export const WalletBalances: React.FC<Props> = ({ userBalance }) => {
  const router = useRouter();
  return (
    <VStack space="sm">
      <HStack className="justify-between">
        <Heading>Accounts</Heading>
        <Button variant="link" onPress={() => router.push('/wallet/manage')} testID="add-button" className="px-2">
          <ButtonIcon as={AddIcon} className="text-primary-500" />
        </Button>
      </HStack>
      <Card variant="flat">
        <VStack space="lg">
          {userBalance?.map(({ balance, assetCode, assetType }, index) => {
            const asset: CryptoAsset = assetType === 'native' ? CryptoAsset.XLM : (assetCode as CryptoAsset);
            return (
              <AssetListTile
                key={index}
                asset={asset}
                subasset={asset}
                trailing={<Text size="lg">{symbolFor(asset, Number(balance))}</Text>}
              />
            );
          })}
        </VStack>
      </Card>
    </VStack>
  );
};
