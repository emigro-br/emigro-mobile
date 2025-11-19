// src/components/wallet/ProfileSheet

import React, { useEffect, useMemo, useState } from 'react';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '@/components/ui/actionsheet';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { sessionStore } from '@/stores/SessionStore';
import { useChainStore } from '@/stores/ChainStore';
import { chainIconMap } from '@/utils/chainIconMap';
import { Copy, X } from 'lucide-react-native';
import { ScrollView, Pressable, Image, Alert, Clipboard } from 'react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { createWalletOnChain } from '@/services/emigro/wallets';



const formatAddress = (addr: string) => `${addr.slice(0, 8)}...${addr.slice(-8)}`;


export const ProfileSheet = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const wallets = sessionStore.user?.wallets ?? [];
  const chains = useChainStore.getState().chains;
  const profileImageUrl =
    (sessionStore.user as any)?.profileImageUrl ??
    (sessionStore.profile as any)?.picture ??
    null;
  const nickname =
	  (sessionStore.user as any)?.username ??
	  (sessionStore.profile as any)?.preferred_username ??
	  null;
	  
  const copyToClipboard = (address: string) => {
    Clipboard.setString(address);
    Alert.alert('Copied', 'Wallet address copied to clipboard');
  };
  // --- "Add new chain" sheet state ---
  const [newChainSheetOpen, setNewChainSheetOpen] = useState(false);
  const [selectedChainId, setSelectedChainId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);


  // User can only add chains they don't already have a wallet for
  const availableChains = useMemo(() => {
    const existing = new Set(wallets.map((w: any) => w.chainId));
    return chains.filter((c: any) => !existing.has(c.id));
  }, [wallets, chains]);

  const selectedChain = useMemo(
    () => availableChains.find((c: any) => c.id === selectedChainId) ?? null,
    [availableChains, selectedChainId]
  );

  // Create wallet on selected chain (calls backend and refreshes user wallets)
  const handleCreateWallet = async () => {
    if (!selectedChain) {
      Alert.alert('Select a chain', 'Please select a chain first.');
      return;
    }
    if (creating) return; // guard double tap
    setCreating(true);
    try {
      await createWalletOnChain(String(selectedChain.id));
      await sessionStore.fetchUser(); // refresh user -> user.wallets gets updated
      Alert.alert('Success', `Wallet created on ${selectedChain.name}.`);
      setNewChainSheetOpen(false);
      setSelectedChainId(null);
    } catch (err: any) {
      console.error('[ProfileSheet] createWalletOnChain error:', err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to create wallet on the selected chain.';
      Alert.alert('Error', message);
    } finally {
      setCreating(false);
    }
  };


  
  // Ensure chains are loaded (and filtered by mainnet+active in the store) when the sheet opens
  useEffect(() => {
    if (visible && (!chains || chains.length === 0)) {
      try {
        useChainStore.getState().fetchChains();
      } catch (e) {
        console.warn('[ProfileSheet] Failed to fetch chains on open:', e);
      }
    }
  }, [visible, chains?.length]);

    return (
      <>
        {/* Existing Profile / Wallets sheet */}
        <Actionsheet isOpen={visible} onClose={onClose}>
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

            <Box style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 8 }}>
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

            <ScrollView style={{ paddingHorizontal: 12, paddingBottom: 80, marginTop: 16, width: '100%' }}>
              <Box style={{ alignItems: 'center', marginBottom: 24 }}>
                {profileImageUrl ? (
                  <Image
                    source={{ uri: profileImageUrl }}
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: 60,
                      borderWidth: 2,
                      borderColor: '#fe0055',
                    }}
                    resizeMode="cover"
                  />
                ) : (
                  <Image
                    source={require('@/assets/images/profile-temp.png')}
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: 60,
                      borderWidth: 2,
                      borderColor: '#fe0055',
                    }}
                  />
                )}

                {nickname ? (
                  <Text style={{ color: '#9ca3af', fontSize: 16, marginTop: 8, textAlign: 'center' }}>
                    {nickname}
                  </Text>
                ) : null}
              </Box>

              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 8, paddingHorizontal: 4 }}>
                Wallets
              </Text>

              <VStack space="md">
                {wallets.map((wallet) => {
                  const chain = chains.find((c) => c.id === wallet.chainId);
                  const iconKey = chain?.iconUrl ?? '';
                  const icon = chainIconMap[iconKey];

                  return (
                    <HStack
                      key={wallet.id}
                      style={{
                        backgroundColor: '#1a1a1a',
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        borderRadius: 16,
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <HStack alignItems="center">
                        {icon ? (
                          <Image source={icon} style={{ width: 24, height: 24, marginRight: 8 }} />
                        ) : (
                          <Box style={{ width: 24, height: 24, marginRight: 8, borderRadius: 12, backgroundColor: '#888' }} />
                        )}
                        <Text style={{ color: '#fff', fontSize: 16 }}>{formatAddress(wallet.publicAddress)}</Text>
                      </HStack>
                      <Pressable onPress={() => copyToClipboard(wallet.publicAddress)}>
                        <Copy size={18} color="#fff" />
                      </Pressable>
                    </HStack>
                  );
                })}
              </VStack>

              {/* NEW: Add new chain button (opens selection sheet) */}
              <Pressable
                onPress={() => setNewChainSheetOpen(true)}
                style={{
                  marginTop: 24,
                  backgroundColor: '#fd0055',
                  borderRadius: 12,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingVertical: 12,
                  opacity: availableChains.length === 0 ? 0.5 : 1,
                }}
                disabled={availableChains.length === 0}
              >
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                  {availableChains.length === 0 ? 'All supported chains added' : 'Add new chain'}
                </Text>
              </Pressable>

              {/*<Pressable
                onPress={() => Alert.alert('Coming soon')}
                style={{
                  marginTop: 24,
                  backgroundColor: '#fd0055',
                  borderRadius: 999,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingVertical: 12,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Manage chains</Text>
              </Pressable>*/}
            </ScrollView>
          </ActionsheetContent>
        </Actionsheet>

        {/* NEW: Chain selection & create wallet placeholder sheet */}
        <Actionsheet isOpen={newChainSheetOpen} onClose={() => { setNewChainSheetOpen(false); setSelectedChainId(null); }}>
          <ActionsheetBackdrop />
          <ActionsheetContent style={{ backgroundColor: '#0a0a0a', borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
            <Box style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 8 }}>
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

            <ScrollView style={{ paddingHorizontal: 12, paddingBottom: 24, marginTop: 8, width: '100%' }}>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 12, paddingHorizontal: 4 }}>
                Select a chain to add
              </Text>

              <VStack space="md">
                {availableChains.length === 0 ? (
                  <Box style={{ backgroundColor: '#1a1a1a', padding: 16, borderRadius: 12 }}>
                    <Text style={{ color: '#9ca3af' }}>
                      You already added all supported chains.
                    </Text>
                  </Box>
                ) : (
                  availableChains.map((c: any) => {
                    const iconKey = c?.iconUrl ?? '';
                    const icon = chainIconMap[iconKey];
                    const isSelected = selectedChainId === c.id;

                    return (
                      <Pressable
                        key={c.id}
                        onPress={() => setSelectedChainId(c.id)}
                        style={{
                          backgroundColor: isSelected ? '#262626' : '#1a1a1a',
                          paddingVertical: 12,
                          paddingHorizontal: 16,
                          borderRadius: 16,
                          borderWidth: isSelected ? 2 : 0,
                          borderColor: '#fd0055',
                        }}
                      >
                        <HStack alignItems="center" style={{ justifyContent: 'space-between' }}>
                          <HStack alignItems="center">
                            {icon ? (
                              <Image source={icon} style={{ width: 24, height: 24, marginRight: 8 }} />
                            ) : (
                              <Box style={{ width: 24, height: 24, marginRight: 8, borderRadius: 12, backgroundColor: '#888' }} />
                            )}
                            <Text style={{ color: '#fff', fontSize: 16 }}>{c.name ?? c.id}</Text>
                          </HStack>
                          {isSelected ? <Text style={{ color: '#fd0055' }}>Selected</Text> : null}
                        </HStack>
                      </Pressable>
                    );
                  })
                )}
              </VStack>

			  <Pressable
			    onPress={handleCreateWallet}
			    style={{
			      marginTop: 24,
			      backgroundColor: selectedChain
			        ? (creating ? '#9ca3af' : '#fd0055')
			        : '#4b5563',
			      borderRadius: 12,
			      justifyContent: 'center',
			      alignItems: 'center',
			      paddingVertical: 12,
			      opacity: creating ? 0.8 : 1,
			    }}
			    disabled={!selectedChain || creating}
			  >
			    <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
			      {creating
			        ? 'Creating wallet, please wait... this may take a few seconds'
			        : (selectedChain
			            ? `Create wallet on ${selectedChain.name ?? selectedChain.id}`
			            : 'Select a chain')}
			    </Text>
			  </Pressable>

            </ScrollView>
          </ActionsheetContent>
        </Actionsheet>
      </>
    );
  };
