import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useColorScheme, Pressable, ActivityIndicator, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { AssetListTile } from '../AssetListTile';
import { Settings, RefreshCw } from 'lucide-react-native';

import { assetIconMap } from '@/utils/assetIcons';
import { useChainStore } from '@/stores/ChainStore';
import { sessionStore } from '@/stores/SessionStore';
import { useWalletBalances } from '@/hooks/useWalletBalances';
import { fetchFiatQuote } from '@/services/emigro/quotes';

import { ManageAssetsActionSheet } from '@/components/wallet/ManageAssetsActionSheet';

import { useFocusEffect } from '@react-navigation/native';

interface Props {
  walletId: string;
  hide?: boolean;
}

export const WalletBalances = ({ walletId, hide = false }: Props) => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  console.log('[Component][WalletBalance] 🔄 Rendering WalletBalances component');

  const { balances, loading, refresh } = useWalletBalances(walletId);

  console.log('[Component][WalletBalance] useWalletBalances -> balances:', balances);
  console.log('[Component][WalletBalance] useWalletBalances -> loading:', loading);

  if (balances.length === 0) {
    console.warn('[Component][WalletBalance] ⚠️ No balances found for walletId:', walletId);
  }
  const [refreshing, setRefreshing] = useState(false);
  const [quotes, setQuotes] = useState<Record<string, number>>({});

  const [manageSheetOpen, setManageSheetOpen] = useState(false);

  const bankCurrency = sessionStore.preferences?.fiatsWithBank?.[0] ?? 'USD';
  
  useFocusEffect(
    React.useCallback(() => {
      console.log('[Component][WalletBalance]  🔁 Screen focused, refreshing...');
      refresh(); // refresh when screen regains focus
    }, [walletId])
  );
  
  useEffect(() => {
	console.log('[Component][WalletBalance] useEffect - fetching chains');
    useChainStore.getState().fetchChains();
  }, []);

  useEffect(() => {
    const fetchQuotes = async () => {
      const result: Record<string, number> = {};
	  console.log('[Component][WalletBalance] Fetching quotes for assets:', balances.map(a => a.symbol));
	  
      await Promise.all(
        balances.map(async (asset) => {
          const price = await fetchFiatQuote(asset.symbol, bankCurrency);
		  console.log(`[Component][WalletBalance] Quote for ${asset.symbol}:`, price);
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
	console.log('[Component][WalletBalance] onRefresh triggered');
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const formatChainName = (chain?: string) => {
    if (!chain) return undefined;
    return chain.charAt(0).toUpperCase() + chain.slice(1);
  };

  return (
    <VStack space="md" testID="wallet-balances">
      {/* 🧩 FIXED HEADER LAYOUT */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 4,
        }}
      >
        <Heading>Assets</Heading>
        <Pressable onPress={onRefresh} disabled={refreshing}>
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
            {refreshing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <RefreshCw size={16} color="#fff" />
            )}
          </View>
        </Pressable>
      </View>

      {loading ? (
        <Text>Loading assets...</Text>
      ) : (
        <VStack space="sm">
          {balances.map((asset, index) => {
			const balance = asset.balance ?? 0;
			const isUSDC = asset.symbol === 'USDC';
			const isETH = asset.symbol === 'ETH';
			const decimals = isUSDC ? 2 : 8;
			const formattedBalance = Number(balance).toFixed(decimals);
			const suffix = !isUSDC && !isETH ? `$${asset.symbol}` : asset.symbol;
			const balanceDisplay = hide ? '****' : `${formattedBalance} ${suffix}`;

			const iconKey = asset.iconUrl?.split('/').pop()?.replace('.png', '').toLowerCase() ?? '';
            const icon = assetIconMap[iconKey];
			console.log('[WalletBalances] 🧩 iconKey:', iconKey, '| iconUrl:', asset.iconUrl);

            const fiatPrice = quotes[asset.symbol];
            const totalInFiat = fiatPrice ? (Number(balance) * fiatPrice).toFixed(2) : '...';

            return (
              <Card
                key={index}
                variant="flat"
                style={{
                  backgroundColor: isDark
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 16,
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                }}
              >
                <AssetListTile
                  asset={asset}
                  icon={icon}
                  subtitle={
                    <>
                      {formatChainName(asset.chain) && (
                        <Text
                          size="sm"
                          weight="normal"
                          color="textSecondary"
                          style={{ marginTop: -5 }}
                        >
                          {formatChainName(asset.chain)}
                        </Text>
                      )}
                      <Text size="md" weight="semibold" style={{ marginTop: 2 }}>
                        {balanceDisplay}
                      </Text>
                    </>
                  }
                  trailing={
                    <VStack alignItems="flex-end">
                      <Text size="md">
                        {totalInFiat}
                      </Text>
                      <Text size="sm" color="textSecondary">
                        {bankCurrency}
                      </Text>
                    </VStack>
                  }
                />
              </Card>
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
              <Text size="md" weight="medium">
                Manage assets
              </Text>
              <Settings size={20} color="#fff" />
            </Card>
          </Pressable>
        </VStack>
      )}
	  <ManageAssetsActionSheet
	    isOpen={manageSheetOpen}
	    onClose={async (refreshNeeded) => {
	      setManageSheetOpen(false);
	      if (refreshNeeded) {
	        console.log('[WalletBalances] 🔁 Refreshing after changes...');
	        await refresh(); // make sure refresh updates the hook state
	      }
	    }}
	    walletId={walletId}
	  />
    </VStack>
  );
};
