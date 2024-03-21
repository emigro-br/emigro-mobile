import { Card, HStack, Heading, Text, VStack } from '@gluestack-ui/themed';

import { IBalance } from '@/types/IBalance';
import { CryptoAsset } from '@/types/assets';

import { AssetToCurrency, AssetToSymbol } from '@utils/assets';

import { AssetListTile } from './AssetListTile';

interface Props {
  userBalance: IBalance[];
}

const Balance: React.FC<Props> = ({ userBalance }) => {
  return (
    <VStack space="sm">
      <Heading>Accounts</Heading>
      <Card variant="flat">
        <VStack space="lg">
          {userBalance?.map(({ balance, assetCode, assetType }, index) => {
            const asset: CryptoAsset =
              assetType === 'native' ? CryptoAsset.XLM : CryptoAsset[assetCode as keyof typeof CryptoAsset];
            const currency = AssetToCurrency[asset];
            return (
              <HStack key={index} justifyContent="space-between" alignItems="center">
                <AssetListTile asset={currency} dense />
                <Text>
                  {AssetToSymbol[asset]} {Number(balance).toFixed(2)}
                </Text>
              </HStack>
            );
          })}
        </VStack>
      </Card>
      <Text size="xs" italic>
        All values are in equivalent stablecoin currency
      </Text>
    </VStack>
  );
};

export default Balance;
