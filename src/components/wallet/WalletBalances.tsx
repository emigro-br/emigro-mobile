import { useRouter } from 'expo-router';
import { useColorScheme, Pressable } from 'react-native';

import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Balance } from '@/services/emigro/types';
import { Asset } from '@/types/assets';
import { AssetListTile } from '../AssetListTile';
import { AddIcon } from '@/components/ui/icon';

import usdcIcon from '@/assets/images/icons/usdc-icon.png';
import ethIcon from '@/assets/images/icons/ethereum.png';

import { Settings } from 'lucide-react-native';

interface Props {
  userBalance: Balance[];
  hide?: boolean;
}

// Default manual assets setup
const defaultAssets: Asset[] = [
  new Asset('crypto', 'USDC', 'USD Coin (Stellar)', '$', 'USD', usdcIcon, 'stellar'),
  new Asset('crypto', 'USDC', 'USD Coin (Base)', '$', 'USD', usdcIcon, 'base'),
  new Asset('crypto', 'ETH', 'Ethereum', 'Ξ', undefined, ethIcon, 'base'),
];

export const WalletBalances = ({ userBalance, hide = false }: Props) => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Find balance for given asset code + chain
  const findBalance = (asset: Asset) => {
    const matches = userBalance.filter((b) => b.assetCode === asset.code);

    if (!matches.length) {
      console.log(`No balance found for ${asset.name}`);
      return 0;
    }

    // Special case: if asset is Stellar and no network, guess it
    if (asset.chain === 'stellar') {
      const stellarBalance = matches.find((b) => !b.network || b.network?.toLowerCase() === 'stellar');
      console.log(`Checking asset: ${asset.name} [stellar] -> Balance Found: ${stellarBalance?.balance ?? 0}`);
      return stellarBalance ? Number(stellarBalance.balance) : 0;
    }

    // Otherwise, match normally by network
    const match = matches.find((b) => {
      const network = b.network?.toLowerCase();
      const chain = asset.chain?.toLowerCase();
      return network === chain;
    });

    console.log(`Checking asset: ${asset.name} [${asset.chain}] -> Balance Found: ${match?.balance ?? 0}`);
    return match ? Number(match.balance) : 0;
  };

  // Helper to format chain name nicely
  const formatChainName = (chain?: string) => {
    if (!chain) return undefined;
    return chain.charAt(0).toUpperCase() + chain.slice(1);
  };

  return (
    <VStack space="md" testID="wallet-balances">
      <Heading>Assets</Heading>

      <VStack space="sm">
        {defaultAssets.map((asset, index) => {
          const balance = findBalance(asset);

          // Show 6 decimals for ETH or other crypto, 2 decimals for stablecoins
          const decimals = asset.code === 'ETH' ? 6 : 2;

          return (
            <Card
              key={index}
              variant="flat"
              style={{
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                borderRadius: 16,
                paddingVertical: 8,
                paddingHorizontal: 16,
              }}
            >
              <AssetListTile
                asset={asset}
                subtitle={
                  formatChainName(asset.chain) && (
                    <Text
                      size="sm"
                      weight="normal"
                      color="textSecondary"
                      style={{ marginTop: -5 }}
                    >
                      {formatChainName(asset.chain)}
                    </Text>
                  )
                }
                trailing={
                  <Text size="md" weight="semibold">
                    {hide ? '****' : `${asset.symbol} ${balance.toFixed(decimals)}`}
                  </Text>
                }
              />
            </Card>
          );
        })}

        {/* Add more assets tile */}
<Pressable onPress={() => router.push('/wallet/manage')} testID="manage-assets-button">
  <Card
    variant="flat"
    style={{
      borderStyle: 'dashed',
      borderWidth: 2,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.5)' : '#ccc',
      backgroundColor: 'transparent',
      borderRadius: 16,
      paddingVertical: 16,
      paddingHorizontal: 16,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 8,
    }}
  >
    <Text size="md" weight="medium">
      Manage assets
    </Text>
    <Settings size={20} color="#fff" />
  </Card>
</Pressable>

      </VStack>
    </VStack>
  );
};
