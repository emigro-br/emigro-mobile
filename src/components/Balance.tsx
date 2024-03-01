import { Avatar, AvatarImage, Card, HStack, Heading, Text, VStack } from '@gluestack-ui/themed';

import { IBalance } from '@/types/IBalance';
import { CryptoAsset } from '@/types/assets';

import { AssetToName, AssetToSymbol, iconFor } from '@utils/assets';

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
                <Avatar size="sm" bg="$transparent">
                  <AvatarImage source={iconFor(asset)} alt={AssetToName[asset]} />
                </Avatar>
                <Text bold size="lg">
                  {AssetToName[asset]}
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
