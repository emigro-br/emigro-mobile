// src/app/(auth)/ramp/[kind]/start.tsx

import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  TextInput,
  RefreshControl,
  ScrollView as RNScrollView,
  View,
} from 'react-native';

import { Stack, useGlobalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { observer } from 'mobx-react-lite';
import * as Haptics from 'expo-haptics';

import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';

import { sessionStore } from '@/stores/SessionStore';
import { balanceStore } from '@/stores/BalanceStore';
import { useWalletBalances } from '@/hooks/useWalletBalances';
import { chainIconMap } from '@/utils/chainIconMap';
import { assetIconMap } from '@/utils/assetIcons';
import { useChainStore } from '@/stores/ChainStore';
import { api } from '@/services/emigro/api';

const CARD_BG = '#0E0E0F';
const CARD_BORDER = '#232326';
const CARD_SELECTED = '#1F2937';
const CHIP_BG = '#141414';
const CHIP_SELECTED = '#1f2937';
const TEXT_MUTED = '#9CA3AF';

const RampStartScreen = () => {
  const { kind } = useGlobalSearchParams();
  const router = useRouter();
  const { user } = sessionStore;

  const wallets = user?.wallets ?? [];
  const firstWallet = wallets[0] ?? null;

  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(firstWallet?.id ?? null);
  const { balances } = useWalletBalances(selectedWalletId);

  const wallet = wallets.find((w) => w.id === selectedWalletId);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [inputAmount, setInputAmount] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const selectedAsset = balances.find((b) => b.assetId === selectedAssetId);

  const chains = useChainStore((state) => state.chains);
  const selectedChain = chains.find((c) => c.id === wallet?.chainId);

  useEffect(() => {
    useChainStore.getState().fetchChains();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (wallets.length > 0) {
        balanceStore.fetchUserBalance().catch(console.warn);
      }
    }, [wallets.length]),
  );

  useEffect(() => {
    if (balances.length > 0 && !selectedAssetId) {
      const defaultAsset = balances.find((b) => b.isActive);
      if (defaultAsset) setSelectedAssetId(defaultAsset.assetId);
    }
  }, [balances]);

  const onRefresh = async () => {
    if (!wallets.length) return;
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await balanceStore.fetchUserBalance({ force: true });
    } catch (e) {
      console.warn(e);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredAssets = useMemo(
    () =>
      balances
        .filter((b) => b.chainId === wallet?.chainId && b.isActive)
        .sort((a, b) => a.symbol.localeCompare(b.symbol)),
    [balances, wallet?.chainId],
  );

  const handleChainChange = (walletId: string) => {
    setSelectedWalletId(walletId);
    const newWallet = wallets.find((w) => w.id === walletId);
    const firstActive = balances.find((b) => b.chainId === newWallet?.chainId && b.isActive);
    setSelectedAssetId(firstActive?.assetId ?? null);
  };

  const isCoinbaseAvailable: boolean = useMemo(() => {
    const settings = (selectedAsset as any)?.onrampSettings;
    // Treat missing settings as "not available"
    return settings?.coinbase === true;
  }, [selectedAsset]);

  const primaryCtaDisabled =
    !inputAmount || !selectedAsset || !wallet || !selectedChain || !isCoinbaseAvailable;

  const primaryCtaLabel = loading
    ? 'Loading...'
    : !selectedAsset
    ? 'Select an asset'
    : !isCoinbaseAvailable
    ? 'Not available on Coinbase yet'
    : 'Pay with Coinbase';

  const handleSubmit = async () => {
    if (!selectedAsset || !wallet || !user?.id || !inputAmount || !selectedChain) return;
    if (!isCoinbaseAvailable) return;

    try {
      setLoading(true);
      const payload = {
        userId: user.id,
        fiatAmount: Number(inputAmount),
        fiatCurrency: 'BRL',
        assetId: selectedAsset.assetId,
        chainId: selectedChain.id,
      };

      console.log('[handleSubmit] Sending payload:', payload);

      const res = await api().post('/coinbase/onramp', payload);
      const { onrampUrl } = res.data;

      router.push({
        pathname: `/ramp/deposit/${selectedAsset.symbol}/webview`,
        params: { url: encodeURIComponent(onrampUrl) },
      });
    } catch (err) {
      console.error('❌ Error submitting transaction', err);
    } finally {
      setLoading(false);
    }
  };

  const renderWalletCard = (wId: string, isSelected: boolean, label: string, icon?: any) => {
    return (
      <Pressable
        key={wId}
        onPress={() => handleChainChange(wId)}
        style={{
          width: '48%',
          backgroundColor: isSelected ? CARD_SELECTED : CARD_BG,
          borderColor: isSelected ? '#334155' : CARD_BORDER,
          borderWidth: 1,
          borderRadius: 14,
          paddingVertical: 12,
          paddingHorizontal: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          marginBottom: 10,
        }}
      >
        {icon ? (
          <Image source={icon} style={{ width: 22, height: 22, resizeMode: 'contain' }} />
        ) : null}
        <Text style={{ color: '#FFF', fontWeight: '600' }}>{label}</Text>
      </Pressable>
    );
  };

  const renderAssetChip = (
    value: string,
    selected: string | null,
    onSelect: (v: string) => void,
    iconSrc?: any,
    label?: string,
    onPressExtra?: () => void,
    coinbaseBadge?: boolean,
  ) => {
    const isSelected = selected === value;

    return (
      <Pressable
        key={value}
        onPress={() => {
          try {
            onPressExtra?.();
          } catch {}
          onSelect(value);
        }}
        style={{
          borderWidth: 1,
          borderColor: isSelected ? '#334155' : CARD_BORDER,
          backgroundColor: isSelected ? CHIP_SELECTED : CHIP_BG,
          borderRadius: 999,
          paddingVertical: 8,
          paddingHorizontal: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          marginRight: 8,
          marginBottom: 10,
        }}
      >
        {iconSrc ? (
          <Image
            source={iconSrc}
            style={{ width: 18, height: 18, resizeMode: 'contain', opacity: isSelected ? 1 : 0.9 }}
          />
        ) : null}
        <Text style={{ color: '#FFF', fontWeight: '600' }}>{label ?? value}</Text>

        {coinbaseBadge ? (
          <View
            style={{
              backgroundColor: '#0b4a2f',
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 999,
              marginLeft: 4,
            }}
          >
            <Text style={{ color: '#A7F3D0', fontSize: 11 }}>Coinbase</Text>
          </View>
        ) : null}
      </Pressable>
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Deposit' }} />

      <Box className="flex-1 bg-background-900">
        <RNScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              title="Refreshing..."
              testID="refresh-control"
            />
          }
          contentContainerStyle={{ padding: 16, paddingBottom: 28 }}
        >
          <VStack className="space-y-4">
            <Heading size="xl" className="text-center" style={{ color: '#ffffff' }}>
              Deposit Crypto
            </Heading>

            {/* NETWORK SECTION */}
            <View
              style={{
                backgroundColor: CARD_BG,
                borderColor: CARD_BORDER,
                borderWidth: 1,
                borderRadius: 14,
                padding: 14,
              }}
            >
              <Text style={{ color: TEXT_MUTED, marginBottom: 8, fontWeight: '600' }}>
                Choose a network
              </Text>

              <HStack wrap="wrap" style={{ justifyContent: 'space-between' }}>
                {wallets.map((w) => {
                  const chain = chains.find((c) => c.id === w.chainId);
                  return renderWalletCard(
                    w.id,
                    selectedWalletId === w.id,
                    chain?.name ?? 'Unknown',
                    chainIconMap[chain?.iconUrl ?? ''],
                  );
                })}
              </HStack>
            </View>

            {/* ASSET SECTION */}
            <View
              style={{
                backgroundColor: CARD_BG,
                borderColor: CARD_BORDER,
                borderWidth: 1,
                borderRadius: 14,
                padding: 14,
              }}
            >
              <Text style={{ color: TEXT_MUTED, marginBottom: 8, fontWeight: '600' }}>
                Select a currency
              </Text>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {filteredAssets.map((a) => {
                  const settings = (a as any)?.onrampSettings;
                  const coinbaseEnabled = settings?.coinbase === true;

                  return renderAssetChip(
                    a.assetId,
                    selectedAssetId,
                    setSelectedAssetId,
                    assetIconMap[a.symbol.toLowerCase()],
                    `${a.name} (${a.symbol})`,
                    () => {
                      console.log('[onramp] asset tapped:', {
                        assetId: a.assetId,
                        symbol: a.symbol,
                        onrampSettings: settings,
                      });
                    },
                    coinbaseEnabled,
                  );
                })}
              </View>

              {/* Availability hint */}
              {selectedAsset ? (
                <Text style={{ color: TEXT_MUTED, marginTop: 6 }}>
                  {isCoinbaseAvailable
                    ? 'This asset is available on Coinbase.'
                    : 'This asset is not currently available on Coinbase.'}
                </Text>
              ) : null}
            </View>

            {/* WALLET + AMOUNT SECTION */}
            <View
              style={{
                backgroundColor: CARD_BG,
                borderColor: CARD_BORDER,
                borderWidth: 1,
                borderRadius: 14,
                padding: 14,
                gap: 14,
              }}
            >
              <View>
                <Text style={{ color: TEXT_MUTED, marginBottom: 6, fontWeight: '600' }}>
                  Wallet address
                </Text>
                <View
                  style={{
                    borderColor: CARD_BORDER,
                    borderWidth: 1,
                    borderRadius: 12,
                    padding: 12,
                    backgroundColor: '#0a0a0a',
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 15 }}>
                    {wallet?.publicAddress ?? 'No wallet'}
                  </Text>
                </View>
              </View>

              <View>
                <Text style={{ color: TEXT_MUTED, marginBottom: 6, fontWeight: '600' }}>
                  Amount (BRL)
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#0a0a0a',
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: CARD_BORDER,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                  }}
                >
                  <TextInput
                    value={inputAmount}
                    onChangeText={setInputAmount}
                    keyboardType="decimal-pad"
                    placeholder="Enter amount"
                    placeholderTextColor="#555"
                    style={{
                      flex: 1,
                      color: '#d1faff',
                      fontSize: 18,
                    }}
                  />
                  <Text style={{ color: '#888', fontSize: 14, marginLeft: 8 }}>BRL</Text>
                </View>
                <Text style={{ color: TEXT_MUTED, marginTop: 6, fontSize: 12 }}>
                  Tip: availability depends on the selected asset/network.
                </Text>
              </View>
            </View>

            {/* PRIMARY CTA */}
            <Button
              className="mt-2 rounded-full"
              style={{ height: 56, opacity: primaryCtaDisabled ? 0.6 : 1 }}
              disabled={primaryCtaDisabled}
              onPress={handleSubmit}
            >
              <ButtonText className="text-lg text-white">{primaryCtaLabel}</ButtonText>
            </Button>
          </VStack>
        </RNScrollView>
      </Box>
    </>
  );
};

export default observer(RampStartScreen);
