import React, { useEffect, useMemo, useState } from 'react';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '@/components/ui/actionsheet';
import { ScrollView } from '@/components/ui/scroll-view';
import { View, Image, Pressable } from 'react-native';
import { X } from 'lucide-react-native';

import { observer } from 'mobx-react-lite';

import { Text } from '@/components/ui/text';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';

import { balanceStore } from '@/stores/BalanceStore';
import { useChainStore } from '@/stores/ChainStore';
import { sessionStore } from '@/stores/SessionStore';

import { chainIconMap } from '@/utils/chainIconMap';
import { assetIconMap } from '@/utils/assetIcons';

type Wallet = {
  id: string;
  chainId: string;
};

type Chain = {
  id: string | number;
  name: string;
  iconUrl?: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  wallets: Wallet[];
  chains: Chain[];
  initialWalletId?: string | null;
  onSelect: (walletId: string, assetId: string) => void;
};

export const SelectAssetSheet = observer(function SelectAssetSheet({
  isOpen,
  onClose,
  wallets,
  chains,
  initialWalletId,
  onSelect,
}: Props) {
  // selected wallet inside the sheet
  const [tempWalletId, setTempWalletId] = useState<string | null>(initialWalletId ?? wallets[0]?.id ?? null);

  // ensure chains are available (icons, names)
  useEffect(() => {
    useChainStore.getState().fetchChains();
  }, []);

  // when the sheet opens, reset the temp wallet and refresh balances (so enabled assets list is fresh)
  useEffect(() => {
    if (isOpen) {
      setTempWalletId(initialWalletId ?? wallets[0]?.id ?? null);
      // refresh aggregated user balances once when opening
      balanceStore.fetchUserBalance({ force: true }).catch(() => {});
      // refresh user object (wallets) if needed
      if (!sessionStore.user) sessionStore.fetchUser().catch(() => {});
    }
  }, [isOpen, initialWalletId, wallets]);

  const tempWallet = useMemo(
    () => wallets.find(w => w.id === tempWalletId) ?? null,
    [wallets, tempWalletId]
  );

  const tempChain = useMemo(
    () => chains.find(c => String(c.id) === String(tempWallet?.chainId)) ?? null,
    [chains, tempWallet]
  );

  // ✅ Only enabled assets on the selected chain
  const enabledAssetsForTempWallet = useMemo(() => {
    const all = balanceStore.userBalance ?? [];
    if (!tempChain?.id) return [];
    return all
      .filter((a: any) => String(a.chainId) === String(tempChain.id) && a.isActive)
      .map((a: any) => ({
        assetId: a.assetId,
        symbol: a.symbol,
        name: a.name || a.symbol,
        balance: a.balance ?? '0',
      }));
  }, [balanceStore.userBalance, tempChain?.id]);

  return (
	<Actionsheet isOpen={isOpen} onClose={onClose}>
	  <ActionsheetBackdrop />
	  <ActionsheetContent style={{ backgroundColor: '#0a0a0a', borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
	    <Pressable
	      onPress={onClose}
	      style={{
	        position: 'absolute',
	        top: 12,
	        right: 16,
	        zIndex: 10,
	        width: 34,
	        height: 34,
	        borderRadius: 16,
	        backgroundColor: '#fe0055',
	        alignItems: 'center',
	        justifyContent: 'center',
	      }}
	    >
	      <X color="#fff" size={20} />
	    </Pressable>

	    <Box style={{ alignItems: 'center', paddingTop: 12 }}>
	      <ActionsheetDragIndicatorWrapper>
	        <ActionsheetDragIndicator
	          style={{
	            width: 80,
	            height: 8,
	            borderRadius: 3,
	            backgroundColor: '#555',
	          }}
	        />
	      </ActionsheetDragIndicatorWrapper>
	    </Box>


        {/* Chains / Wallets row */}
		<ScrollView
		  horizontal
		  showsHorizontalScrollIndicator={false}
		  contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: 8, gap: 8, marginTop: 22 }}
		>

          {wallets.map((w) => {
            const walletChain = chains.find((c) => String(c.id) === String(w.chainId));
            const isSelected = w.id === tempWalletId;
            const chainIcon = chainIconMap[walletChain?.iconUrl ?? ''];

            return (
              <Pressable key={w.id} onPress={() => setTempWalletId(w.id)}>
                <Box
                  className={`flex flex-row items-center px-4 py-2 rounded-md border ${
                    isSelected ? 'bg-[#FF0050] border-[#FF668A]' : 'bg-[#2b2b2b] border-[#FF668A]'
                  }`}
                >
                  {chainIcon ? (
                    <Image source={chainIcon} style={{ width: 24, height: 24, borderRadius: 12, marginRight: 8 }} />
                  ) : (
                    <View style={{ width: 24, height: 24, borderRadius: 12, marginRight: 8, backgroundColor: '#666' }} />
                  )}
                  <Text className="text-white">{walletChain?.name ?? 'Unknown'}</Text>
                </Box>
              </Pressable>
            );
          })}
        </ScrollView>

		{/* Enabled assets list */}
		<ScrollView style={{ width: '100%', paddingHorizontal: 12, paddingBottom: 28, marginTop: 8 }}>
          {enabledAssetsForTempWallet.map((item) => {
            const icon = assetIconMap[(item.symbol || '').toLowerCase()] ?? assetIconMap['default'];
            const balanceNum = parseFloat(String(item.balance ?? '0'));
            return (
				<Pressable
				  key={item.assetId}
				  onPress={() => {
				    if (tempWalletId) onSelect(tempWalletId, item.assetId);
				  }}
				  style={{
				    flexDirection: 'row',
				    alignItems: 'center',
				    paddingVertical: 12,
				    paddingHorizontal: 12,
				    backgroundColor: '#1a1a1a',
				    borderRadius: 16,
				    marginBottom: 12,
				  }}
				>

                {icon ? (
                  <Image source={icon} style={{ width: 36, height: 36, borderRadius: 18, marginRight: 12 }} />
                ) : (
                  <View style={{ width: 36, height: 36, borderRadius: 18, marginRight: 12, backgroundColor: '#555' }} />
                )}
                <View style={{ flex: 1 }}>
                  <Text className="text-white" style={{ fontWeight: '600' }}>
                    {item.name} ({item.symbol})
                  </Text>
                  <Text className="text-gray-300" style={{ marginTop: 2 }}>
                    Balance: {balanceNum.toFixed(6)} {item.symbol}
                  </Text>
                </View>
              </Pressable>
            );
          })}


        </ScrollView>
      </ActionsheetContent>
    </Actionsheet>
  );
});
