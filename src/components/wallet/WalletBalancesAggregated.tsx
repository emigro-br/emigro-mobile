// src/components/wallet/WalletBalancesAggregated.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Image, Pressable, View, useColorScheme } from 'react-native';

import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Settings, RefreshCw } from 'lucide-react-native';

import { balanceStore } from '@/stores/BalanceStore';
import { sessionStore } from '@/stores/SessionStore';
import { useChainStore } from '@/stores/ChainStore';

import { assetIconMap } from '@/utils/assetIcons';
import { fetchFiatQuote } from '@/services/emigro/quotes';
import { ensurePrimaryCurrencyExists, fetchPrimaryCurrency } from '@/services/emigro/userPrimaryCurrency';

import { ManageAssetsActionSheet } from '@/components/wallet/ManageAssetsActionSheet';
import { AssetDetailsSheet } from '@/components/wallet/AssetDetailsSheet';

interface PrimaryCurrencyResponse {
  chainId: string;
  assetId: string;
  chainIdOnchain: number;
}

type Props = {
  hide?: boolean;
  headerRefreshing?: boolean;
  onRefreshAll?: () => Promise<void> | void;
};

export const WalletBalancesAggregated = observer(function WalletBalancesAggregated({
  hide = false,
  headerRefreshing = false,
  onRefreshAll,
}: Props) {
  const isDark = useColorScheme() === 'dark';

  const [refreshing, setRefreshing] = useState(false);
  const [quotes, setQuotes] = useState<Record<string, number>>({});
  const [primaryCurrency, setPrimaryCurrency] = useState<PrimaryCurrencyResponse | null>(null);

  const [manageSheetOpen, setManageSheetOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
  const [isAssetSheetOpen, setAssetSheetOpen] = useState(false);

  const bankCurrency = sessionStore.preferences?.fiatsWithBank?.[0] ?? 'USD';

  // Ensure chains are in the store (for chain icon)
  useEffect(() => {
    useChainStore.getState().fetchChains();
  }, []);

  // Load / refresh aggregated balances on focus
  useFocusEffect(
    React.useCallback(() => {
      balanceStore.fetchUserBalance().catch(() => {});
    }, [])
  );

  // Load primary currency (and ensure it exists once)
  useEffect(() => {
    (async () => {
      const c = await ensurePrimaryCurrencyExists();
      if (c) setPrimaryCurrency(c);
    })();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await balanceStore.fetchUserBalance({ force: true });
    } finally {
      setRefreshing(false);
    }
  };

  // quotes for visible assets
  useEffect(() => {
    const fetchQuotes = async () => {
      const result: Record<string, number> = {};
      const balances = balanceStore.userBalance ?? [];
      await Promise.all(
        balances.map(async (asset) => {
          const price = await fetchFiatQuote(asset.symbol, bankCurrency);
          if (price !== null) result[asset.symbol] = price;
        })
      );
      setQuotes(result);
    };

    if ((balanceStore.userBalance?.length ?? 0) > 0) {
      fetchQuotes();
    }
  }, [balanceStore.userBalance, bankCurrency]);

  const refreshPrimary = async () => {
    const c = await fetchPrimaryCurrency();
    if (c) setPrimaryCurrency(c);
  };

  // sort: primary first, then alphabetical by symbol
  const sortedBalances = useMemo(() => {
    const balances = balanceStore.userBalance ?? [];
    const primaryAssetId = primaryCurrency?.assetId;

    return [...balances].sort((a: any, b: any) => {
      const aPrimary = primaryAssetId && a.assetId === primaryAssetId ? 1 : 0;
      const bPrimary = primaryAssetId && b.assetId === primaryAssetId ? 1 : 0;

      if (aPrimary !== bPrimary) return bPrimary - aPrimary;

      const aSym = (a.symbol || '').toUpperCase();
      const bSym = (b.symbol || '').toUpperCase();
      if (aSym < bSym) return -1;
      if (aSym > bSym) return 1;
      return 0;
    });
  }, [balanceStore.userBalance, primaryCurrency?.assetId]);

  return (
    <VStack space="md" testID="wallet-balances-aggregated">
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <Heading>Assets</Heading>
        <Pressable onPress={onRefreshAll ? onRefreshAll : onRefresh} disabled={headerRefreshing || refreshing}>
          <View
            style={{
              backgroundColor: '#222',
              borderRadius: 999,
              width: 32,
              height: 32,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {(headerRefreshing || refreshing) ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <RefreshCw size={16} color="#fff" />
            )}
          </View>
        </Pressable>
      </View>

      <VStack space="sm">
        {sortedBalances.map((asset: any, index: number) => {
          const rawBalance = asset.balance ?? '0';
          const parsedBalance = parseFloat(rawBalance);
          const isUSDC = asset.symbol === 'USDC';
          const isETH = asset.symbol === 'ETH';
          const decimals = isUSDC ? 6 : 8;
          const formattedBalance = parsedBalance.toFixed(decimals);
          const suffix = !isUSDC && !isETH ? `${asset.symbol}` : asset.symbol;
          const balanceDisplay = hide ? '****' : `${formattedBalance} ${suffix}`;

		  const icon =
		    assetIconMap[(asset?.symbol || '').toLowerCase()] ??
		    assetIconMap['default'];


          const chain = useChainStore.getState().getChainById(asset.chainId);
          const chainIcon = chain?.icon;

          const fiatPrice = quotes[asset.symbol];
          const totalInFiat = fiatPrice ? (parsedBalance * fiatPrice).toFixed(2) : '...';

          const isPrimary = primaryCurrency?.assetId === asset.assetId;

          return (
            <Pressable
              key={asset.assetId ?? `${asset.chainId}:${asset.symbol}:${index}`}
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
                    {icon && <Image source={icon} style={{ width: 48, height: 48 }} resizeMode="contain" />}
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
                        }}
                        resizeMode="contain"
                      />
                    )}
                  </View>

                  <VStack>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ color: '#fff', fontWeight: 'bold' }}>{asset.name || asset.symbol}</Text>
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
                      <Text size="sm" style={{ color: '#ccc' }}>
                        {balanceDisplay}
                      </Text>
                    </View>
                  </VStack>
                </View>

                {/* Right: Fiat Value + Currency */}
                <VStack alignItems="flex-end">
                  <Text size="md" style={{ color: '#fff' }}>
                    {totalInFiat}
                  </Text>
                  <Text size="sm" style={{ color: '#aaa' }}>
                    {bankCurrency}
                  </Text>
                </VStack>
              </Card>
            </Pressable>
          );
        })}

        {/* Manage assets once (bottom) */}
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
              marginTop: 5,
              marginBottom: 16,
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

      <ManageAssetsActionSheet
        isOpen={manageSheetOpen}
        onClose={async (refreshNeeded) => {
          setManageSheetOpen(false);
          if (refreshNeeded) {
            if (onRefreshAll) {
              await onRefreshAll();
            } else {
              await balanceStore.fetchUserBalance({ force: true });
            }
            await refreshPrimary();
          }
        }}
        // This prop is still required by the sheet, but it routes actions by chain internally.
        walletId={sessionStore.user?.wallets?.[0]?.id ?? ''}
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
});
