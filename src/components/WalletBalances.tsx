import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AddIcon, Button, ButtonIcon, Card, HStack, Heading, Text, VStack } from '@gluestack-ui/themed';

import { WalletStackParamList } from '@/navigation/WalletStack';
import { Balance } from '@/services/emigro/types';
import { CryptoAsset } from '@/types/assets';
import { AssetToCurrency, AssetToSymbol } from '@/utils/assets';

import { AssetListTile } from './AssetListTile';

interface Props {
  navigation: NativeStackNavigationProp<WalletStackParamList>;
  userBalance: Balance[];
}

export const WalletBalances: React.FC<Props> = ({ userBalance, navigation }) => {
  return (
    <VStack space="sm">
      <HStack justifyContent="space-between">
        <Heading>Accounts</Heading>
        <Button variant="link" px="$2" onPress={() => navigation.push('ManageAccounts')} testID="add-button">
          <ButtonIcon as={AddIcon} color="$primary500" />
        </Button>
      </HStack>
      <Card variant="flat">
        <VStack space="lg">
          {userBalance?.map(({ balance, assetCode, assetType }, index) => {
            const asset: CryptoAsset =
              assetType === 'native' ? CryptoAsset.XLM : CryptoAsset[assetCode as keyof typeof CryptoAsset];
            const currency = asset === CryptoAsset.XLM ? CryptoAsset.XLM : AssetToCurrency[asset];
            return (
              <AssetListTile
                key={index}
                asset={currency}
                trailing={
                  <Text>
                    {AssetToSymbol[asset]} {Number(balance).toFixed(2)}
                  </Text>
                }
                dense
              />
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
