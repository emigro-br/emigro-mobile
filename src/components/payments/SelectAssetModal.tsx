import React, { useEffect, useMemo, useState } from 'react';
import { Modal, View, FlatList, Pressable, Image } from 'react-native';
import { observer } from 'mobx-react-lite';

import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';

import { balanceStore } from '@/stores/BalanceStore';
import { useChainStore } from '@/stores/ChainStore';

import { chainIconMap } from '@/utils/chainIconMap';
import { assetIconMap } from '@/utils/assetIcons';

type Wallet = {
  id: string;
  chainId: string;
};

type Chain = {
  id: string;
  name: string;
  iconUrl?: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  wallets: Wallet[];
  chains: Chain[];
  initialWalletId?: string | null;
  onSelect: (walletId: string, assetId: string) => void;
};

export const AssetWalletSelectorModal = observer(function AssetWalletSelectorModal({
  visible,
  onClose,
  wallets,
  chains,
  initialWalletId,
  onSelect,
}: Props) {
  const [tempWalletId, setTempWalletId] = useState<string | null>(initialWalletId ?? wallets[0]?.id ?? null);

  // keep chains fresh (icons & names)
  useEffect(() => {
    useChainStore.getState().fetchChains();
  }, []);

  // reset wallet when modal opens
  useEffect(() => {
    if (visible) {
      setTempWalletId(initialWalletId ?? wallets[0]?.id ?? null);
    }
  }, [visible, initialWalletId, wallets]);

  const tempWallet = useMemo(() => wallets.find(w => w.id === tempWalletId) ?? null, [wallets, tempWalletId]);
  const tempChain = useMemo(() => chains.find(c => c.id === tempWallet?.chainId) ?? null, [chains, tempWallet]);

  // ✅ Show ONLY assets the user has enabled on that chain
  const enabledAssetsForTempWallet = useMemo(() => {
    const all = balanceStore.userBalance ?? [];
    if (!tempChain?.id) return [];
    return all
      .filter((a: any) => a.chainId === tempChain.id && a.isActive)
      .map((a: any) => ({
        assetId: a.assetId,
        symbol: a.symbol,
        name: a.name || a.symbol,
        balance: a.balance ?? '0',
      }));
  }, [balanceStore.userBalance, tempChain?.id]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-center items-center bg-black/80">
        <Card className="w-11/12 p-4 bg-[#222] rounded-xl max-h-[90%]">
          <Heading className="text-white mb-4">Select Asset</Heading>

          {/* Wallet / Chain Selector */}
          <FlatList
            horizontal
            data={wallets}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ marginBottom: 16 }}
            renderItem={({ item }) => {
              const walletChain = chains.find((c) => c.id === item.chainId);
              const isSelected = item.id === tempWalletId;
              const chainIcon = chainIconMap[walletChain?.iconUrl ?? ''];

              return (
                <Pressable onPress={() => setTempWalletId(item.id)} className="mr-3">
                  <Box
                    className={`flex flex-row items-center px-4 py-2 rounded-md border transition-all duration-200 ${
                      isSelected
                        ? 'bg-[#FF0050] text-white border-[#FF668A]'
                        : 'bg-[#2b2b2b] text-white border-[#FF668A] hover:bg-[#330012]'
                    }`}
                  >
                    {chainIcon && (
                      <Image
                        source={chainIcon}
                        className="w-8 h-8 mr-2 rounded-full"
                        resizeMode="contain"
                      />
                    )}
                    <Text className={isSelected ? 'text-white' : 'text-gray'}>
                      {walletChain?.name ?? 'Unknown'}
                    </Text>
                  </Box>
                </Pressable>
              );
            }}
          />

          {/* Enabled Assets for the selected wallet/chain */}
          <FlatList
            data={enabledAssetsForTempWallet}
            keyExtractor={(item) => item.assetId}
            renderItem={({ item }) => {
              const icon = assetIconMap[(item.symbol || '').toLowerCase()] ?? assetIconMap['default'];
              const balanceNum = parseFloat(String(item.balance ?? '0'));
              return (
                <Pressable
                  onPress={() => {
                    if (tempWalletId) {
                      onSelect(tempWalletId, item.assetId);
                    }
                  }}
                  className="flex-row items-center py-3 px-4 mb-2 bg-[#3a3a3a] rounded-lg"
                >
                  {icon && (
                    <Image
                      source={icon}
                      className="w-10 h-10 mr-4 rounded-full"
                      resizeMode="contain"
                    />
                  )}
                  <View className="flex-1">
                    <Text className="text-white text-base font-semibold">
                      {item.name} ({item.symbol})
                    </Text>
                    <Text className="text-gray-300 text-sm">
                      Balance: {balanceNum.toFixed(6)} {item.symbol}
                    </Text>
                  </View>
                </Pressable>
              );
            }}
          />

          <Button
            onPress={onClose}
            className="mt-4 border border-white bg-transparent px-4 py-2 rounded-md"
          >
            <ButtonText className="text-white">Cancel</ButtonText>
          </Button>
        </Card>
      </View>
    </Modal>
  );
});
