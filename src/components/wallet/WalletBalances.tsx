// walletbalance

import React, { useEffect, useState } from 'react';
import { useColorScheme, ActivityIndicator, View, Pressable, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Settings, RefreshCw } from 'lucide-react-native';

import { assetIconMap } from '@/utils/assetIcons';
import { useChainStore } from '@/stores/ChainStore';
import { sessionStore } from '@/stores/SessionStore';
import { useWalletBalances } from '@/hooks/useWalletBalances';
import { fetchFiatQuote } from '@/services/emigro/quotes';

import { ManageAssetsActionSheet } from '@/components/wallet/ManageAssetsActionSheet';
import { AssetDetailsSheet } from '@/components/wallet/AssetDetailsSheet';
import { ensurePrimaryCurrencyExists } from '@/services/emigro/userPrimaryCurrency';
import { fetchPrimaryCurrency } from '@/services/emigro/userPrimaryCurrency';

interface PrimaryCurrencyResponse {
  chainId: string;
  assetId: string;
  chainIdOnchain: number;
}

interface Props {
  walletId: string;
  hide?: boolean;
}

export const WalletBalances = ({ walletId, hide = false }: Props) => {
  const isDark = useColorScheme() === 'dark';
  const { balances, loading, refresh } = useWalletBalances(walletId);

  const [refreshing, setRefreshing] = useState(false);
  const [quotes, setQuotes] = useState<Record<string, number>>({});
  const [primaryCurrency, setPrimaryCurrency] = useState<PrimaryCurrencyResponse | null>(null);
  const [manageSheetOpen, setManageSheetOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
  const [isAssetSheetOpen, setAssetSheetOpen] = useState(false);

  const bankCurrency = sessionStore.preferences?.fiatsWithBank?.[0] ?? 'USD';

  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [walletId])
  );

  useEffect(() => {
    useChainStore.getState().fetchChains();
  }, []);

  useEffect(() => {
    const loadPrimary = async () => {
      const currency = await ensurePrimaryCurrencyExists();
      if (currency) setPrimaryCurrency(currency);
    };
    loadPrimary();
  }, [walletId]);

  useEffect(() => {
    const fetchQuotes = async () => {
      const result: Record<string, number> = {};
      await Promise.all(
        balances.map(async (asset) => {
          const price = await fetchFiatQuote(asset.symbol, bankCurrency);
          if (price !== null) result[asset.symbol] = price;
        })
      );
      setQuotes(result);
    };

    if (balances.length > 0) {
      fetchQuotes();
    }
  }, [balances, bankCurrency]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const refreshPrimary = async () => {
    const currency = await fetchPrimaryCurrency();
    if (currency) {
      setPrimaryCurrency(currency);

    }
  };
  
  return (
    <VStack space="md" testID="wallet-balances">
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <Heading>Assets</Heading>
        <Pressable onPress={onRefresh} disabled={refreshing}>
          <View style={{
            backgroundColor: '#222',
            borderRadius: 999,
            width: 32,
            height: 32,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            {refreshing ? <ActivityIndicator size="small" color="#fff" /> : <RefreshCw size={16} color="#fff" />}
          </View>
        </Pressable>
      </View>

      {loading ? (
        <Text>Loading assets...</Text>
      ) : (
        <VStack space="sm">
          {balances.map((asset, index) => {
            const rawBalance = asset.balance ?? '0';
            const parsedBalance = parseFloat(rawBalance);
            const isUSDC = asset.symbol === 'USDC';
            const isETH = asset.symbol === 'ETH';
            const decimals = isUSDC ? 6 : 8;
            const formattedBalance = parsedBalance.toFixed(decimals);
            const suffix = !isUSDC && !isETH ? `${asset.symbol}` : asset.symbol;
            const balanceDisplay = hide ? '****' : `${formattedBalance} ${suffix}`;

            const iconKey = asset.iconUrl?.split('/').pop()?.replace('.png', '').toLowerCase() ?? '';
            const icon = assetIconMap[iconKey];

            const chain = useChainStore.getState().getChainById(asset.chainId);
            const chainIcon = chain?.icon;

            console.log('Asset:', asset.name || asset.symbol);
            console.log('Chain ID:', asset.chainId);
            console.log('Found chain:', chain?.name);
            console.log('Has chain icon:', !!chainIcon);

            const fiatPrice = quotes[asset.symbol];
            const totalInFiat = fiatPrice ? (parsedBalance * fiatPrice).toFixed(2) : '...';

            const isPrimary = primaryCurrency?.assetId === asset.assetId;

            return (
              <Pressable
                key={index}
                onPress={() => {
                  setSelectedAsset(asset);
                  setAssetSheetOpen(true);
                }}
              >
                <Card
                  variant="flat"
                  style={{
                    backgroundColor: '#2e2e2e',
                    borderRadius: 16,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
				
                  {/* Left: Icon + Asset Name + Balance */}
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 48, height: 48, marginRight: 12, position: 'relative' }}>
                      {icon && (
                        <Image
                          source={icon}
                          style={{ width: 48, height: 48 }}
                          resizeMode="contain"
                        />
                      )}
                      {chainIcon && (
                        <Image
                          source={chainIcon}
                          style={{
                            width: 22,
                            height: 22,
                            position: 'absolute',
                            bottom: -2,
                            right: -2,
                            borderRadius: 7,
                            backgroundColor: '#000',
                          }}
                          resizeMode="contain"
                        />
                      )}
                    </View>

                    <VStack>

					<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					  <Text style={{ color: '#fff', fontWeight: 'bold' }}>
					    {asset.name || asset.symbol}
					  </Text>
					  {isPrimary && (
					    <View
					      style={{
					        marginLeft: 6,
					        backgroundColor: '#444',
					        paddingHorizontal: 6,
					        paddingVertical: 2,
					        borderRadius: 6,
					      }}
					    >
					      <Text size="xs" weight="bold" style={{ color: '#fff' }}>
					        Primary
					      </Text>
					    </View>
					  )}
					</View>


                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                        <Text size="sm" style={{ color: '#ccc' }}>{balanceDisplay}</Text>
                      </View>
                    </VStack>
                  </View>

                  {/* Right: Fiat Value + Currency */}
                  <VStack alignItems="flex-end">
                    <Text size="md" style={{ color: '#fff' }}>{totalInFiat}</Text>
                    <Text size="sm" style={{ color: '#aaa' }}>{bankCurrency}</Text>
                  </VStack>
                </Card>
              </Pressable>
            );
          })}

          <Pressable onPress={() => setManageSheetOpen(true)} testID="manage-assets-button">
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
              <Text size="md" weight="medium">Manage assets</Text>
              <Settings size={20} color="#fff" />
            </Card>
          </Pressable>
        </VStack>
      )}

      <ManageAssetsActionSheet
        isOpen={manageSheetOpen}
        onClose={async (refreshNeeded) => {
          setManageSheetOpen(false);
          if (refreshNeeded) await refresh();
        }}
        walletId={walletId}
      />

	  <AssetDetailsSheet
	    isOpen={isAssetSheetOpen}
	    onClose={() => {
	      setAssetSheetOpen(false);
	      refreshPrimary();
	    }}
	    asset={selectedAsset}
	    onPrimaryCurrencyChanged={refreshPrimary}
	  />
    </VStack>
  );
};
