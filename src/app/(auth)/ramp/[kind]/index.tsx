// src/app/(auth)/ramp/[kind]/start.tsx

// src/app/(auth)/ramp/[kind]/start.tsx

import React, { useEffect, useState } from 'react';
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

const RampStartScreen = () => {
  const { kind } = useGlobalSearchParams();
  const router = useRouter();
  const { user } = sessionStore;

  const wallets = user?.wallets ?? [];
  const firstWallet = wallets[0] ?? null;

  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(firstWallet?.id ?? null);
  const { balances } = useWalletBalances(selectedWalletId);

  const wallet = wallets.find(w => w.id === selectedWalletId);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [inputAmount, setInputAmount] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const selectedAsset = balances.find(b => b.assetId === selectedAssetId);

  const chains = useChainStore((state) => state.chains);
  const selectedChain = chains.find(c => c.id === wallet?.chainId);

  useEffect(() => {
    useChainStore.getState().fetchChains();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (wallets.length > 0) {
        balanceStore.fetchUserBalance().catch(console.warn);
      }
    }, [wallets.length])
  );

  useEffect(() => {
    if (balances.length > 0 && !selectedAssetId) {
      const defaultAsset = balances.find(b => b.isActive);
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

  const filteredAssets = balances.filter(b => b.chainId === wallet?.chainId && b.isActive);

  const handleChainChange = (walletId: string) => {
    setSelectedWalletId(walletId);
    const newWallet = wallets.find(w => w.id === walletId);
    const firstActive = balances.find(b => b.chainId === newWallet?.chainId && b.isActive);
    setSelectedAssetId(firstActive?.assetId ?? null);
  };

  const handleSubmit = async () => {
    if (!selectedAsset || !wallet || !user?.id || !inputAmount || !selectedChain) return;

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


  const renderSelectableCard = (
    value: string,
    selected: string | null,
    onSelect: (v: string) => void,
    iconSrc?: any,
    displayLabel?: string
  ) => {
    const isSelected = selected === value;

    console.log(`[renderSelectableCard] value: ${value}, selected: ${selected}, isSelected: ${isSelected}`);

    return (
      <Pressable
        key={value}
        onPress={() => {
          console.log(`[onPress] Card clicked: ${value}`);
          onSelect(value);
        }}
        style={{
          borderWidth: 2,
          borderColor: isSelected ? '#ff4d4d' : '#3c3c3c',
          backgroundColor: isSelected ? '#fe0055' : '#141414',
          borderRadius: 12,
          paddingVertical: 10,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          marginHorizontal: 6,
          marginVertical: 4,
        }}
      >
        {iconSrc && (
          <Image
            source={iconSrc}
            style={{ width: 20, height: 20, marginRight: 8, resizeMode: 'contain' }}
          />
        )}
        <Text size="md" className="font-semibold" style={{ color: '#ffffff' }}>
          {(displayLabel ?? value).toUpperCase()}
        </Text>
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
          contentContainerStyle={{ padding: 16 }}
        >
          <VStack className="space-y-4">
            <Heading size="xl" className="text-center" style={{ color: '#ffffff' }}>
              Deposit Crypto
            </Heading>

            <Text className="text-gray-400 mt-4">Choose a network</Text>
            <HStack wrap="wrap">
			{wallets.map(w => {
			  const chain = chains.find(c => c.id === w.chainId);
			  return renderSelectableCard(
			    w.id,
			    selectedWalletId,
			    handleChainChange,
			    chainIconMap[chain?.iconUrl ?? ''],
			    chain?.name ?? 'Unknown'
			  );
			})}
            </HStack>

            <Text className="text-gray-400 mt-4">Select a currency</Text>
			<View
			  style={{
			    flexDirection: 'row',
			    flexWrap: 'wrap',
			    justifyContent: 'flex-start',
			    gap: 8,
			  }}
			>
			  {filteredAssets.map(a =>
			    renderSelectableCard(
			      a.assetId,
			      selectedAssetId,
			      setSelectedAssetId,
			      assetIconMap[a.symbol.toLowerCase()],
			      `${a.name} (${a.symbol})`
			    )
			  )}
			</View>


            <Box className="mt-4">
              <Text className="text-gray-400 mb-1">Wallet address</Text>
              <Box
                style={{
                  borderColor: '#e5e7eb',
                  borderWidth: 0,
                  borderRadius: 12,
                  padding: 0,
                  backgroundColor: '#0a0a0a',
                }}
              >
                <Text style={{ color: '#fff', fontSize: 16 }}>
                  {wallet?.publicAddress ?? 'No wallet'}
                </Text>
              </Box>
            </Box>

			<View
			  style={{
			    flexDirection: 'row',
			    alignItems: 'center',
			    backgroundColor: '#0a0a0a',
			    borderRadius: 12,
			    borderWidth: 1,
			    borderColor: '#333',
			    paddingHorizontal: 16,
			    paddingVertical: 12,
			    marginTop: 20,
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
			  <Text
			    style={{
			      color: '#666',
			      fontSize: 16,
			      marginLeft: 8,
			    }}
			  >
			    BRL
			  </Text>
			</View>


            <Button
              className="mt-6 rounded-full"
              style={{ height: 56 }}
              disabled={!inputAmount || !selectedAsset || !wallet || !selectedChain}
              onPress={handleSubmit}
            >
              <ButtonText className="text-lg text-white">
                {loading ? 'Loading...' : 'Pay with Coinbase'}
              </ButtonText>
            </Button>
          </VStack>
		  

        </RNScrollView>
      </Box>
    </>
  );
};

export default observer(RampStartScreen);
