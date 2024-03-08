import { Card, HStack, Heading, Text, VStack } from '@gluestack-ui/themed';

import { IBalance } from '@/types/IBalance';
import { CryptoAsset } from '@/types/assets';

import { AssetToSymbol, labelFor } from '@utils/assets';

import { AssetAvatar } from './AssetAvatar';

interface Props {
  userBalance: IBalance[];
}

const Balance: React.FC<Props> = ({ userBalance }) => {
  return (
    <VStack space="sm">
      <Heading>Accounts</Heading>
      {userBalance?.map(({ balance, assetCode, assetType }, index) => {
        const asset: CryptoAsset =
          assetType === 'native' ? CryptoAsset.XLM : CryptoAsset[assetCode as keyof typeof CryptoAsset];
        return (
          <Card key={index} size="lg" variant="outline">
            <HStack justifyContent="space-between">
              <HStack space="md">
                <AssetAvatar item={asset} />
                <Text bold size="lg">
                  {labelFor(asset)}
                </Text>
              </HStack>
              <Text>
                {AssetToSymbol[asset]} {Number(balance).toFixed(2)}
              </Text>
            </HStack>
          </Card>
        );
      })}
    </VStack>
  );
};

export default Balance;
