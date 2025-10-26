// src/components/wallet/ProfileSheet

import React from 'react';
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



const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-6)}`;


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

  return (
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
  );
};