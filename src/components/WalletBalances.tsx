import { AddIcon, Button, ButtonIcon, Card, HStack, Heading, Text, VStack } from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';

import { Balance } from '@/services/emigro/types';
import { CryptoAsset } from '@/types/assets';
import { symbolFor } from '@/utils/assets';

import { AssetListTile } from './AssetListTile';

interface Props {
  userBalance: Balance[];
}

export const WalletBalances: React.FC<Props> = ({ userBalance }) => {
  const router = useRouter();
  return (
    <VStack space="sm">
      <HStack justifyContent="space-between">
        <Heading>Accounts</Heading>
        <Button variant="link" px="$2" onPress={() => router.push('/wallet/manage')} testID="add-button">
          <ButtonIcon as={AddIcon} color="$primary500" />
        </Button>
      </HStack>
      <Card variant="flat">
        <VStack space="lg">
          {userBalance?.map(({ balance, assetCode, assetType }, index) => {
            const asset: CryptoAsset =
              assetType === 'native' ? CryptoAsset.XLM : CryptoAsset[assetCode as keyof typeof CryptoAsset];
            return (
              <AssetListTile
                key={index}
                asset={asset}
                subasset={asset}
                trailing={<Text>{symbolFor(asset, Number(balance))}</Text>}
                dense
              />
            );
          })}
        </VStack>
      </Card>
    </VStack>
  );
};
