// src/app/(auth)/transfers/index.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Modal,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { AssetListTile } from '@/components/AssetListTile';
import { assetIconMap } from '@/utils/assetIcons';
import { sessionStore } from '@/stores/SessionStore';
import { balanceStore } from '@/stores/BalanceStore';
import { Card } from '@/components/ui/card';
import { Button, ButtonText } from '@/components/ui/button';
import { TouchableOpacity } from 'react-native';

import { useChainStore } from '@/stores/ChainStore';


const Transfers = () => {
	const router = useRouter();
	const { user } = sessionStore;
	const wallets = user?.wallets ?? [];
	const balances = balanceStore.userBalance ?? [];

	const [selectedAsset, setSelectedAsset] = useState<any | null>(null);


  const [recipientAddress, setRecipientAddress] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  
  const [addressError, setAddressError] = useState('');

  const chains = useChainStore((state) => state.chains);
  
  // Ensure chains and balances are loaded (multichain)
  useEffect(() => {
    // Load chains (for names/icons)
    useChainStore.getState().fetchChains();

    // Load aggregated balances across all chains
    balanceStore.fetchUserBalance().catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedAsset) {
      setModalVisible(true);
    }
  }, [selectedAsset]);

  const openTransferModal = (asset: any) => {
    if (!asset) return;
    setSelectedAsset(asset); // Modal now opens in useEffect
    setRecipientAddress('');
  };
  
  const getChainNameById = (id: string) => {
    return chains.find(c => c.id === id)?.name ?? 'Unknown';
  };

  const isValidEvmAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };
  
  const handleContinueToAmount = () => {
    if (!isValidEvmAddress(recipientAddress)) {
      setAddressError('Please enter a valid EVM address.');
      return;
    }

    if (!selectedAsset) {
      setAddressError('Please select an asset first.');
      return;
    }

    const sourceWallet =
      wallets.find((w: any) => w.chainId === selectedAsset.chainId) ?? null;

    if (!sourceWallet) {
      setAddressError('No wallet found for the selected chain.');
      return;
    }

    setAddressError('');
    setModalVisible(false);
    router.push({
      pathname: '/transfers/amount',
      params: {
        assetId: selectedAsset.assetId,
        symbol: selectedAsset.symbol,
        name: selectedAsset.name,
        balance: selectedAsset.balance,
        chainId: selectedAsset.chainId,
        recipientAddress,
        walletId: sourceWallet.id,
      },
    });
  };


  

  
  return (
    <>
	<Stack.Screen options={{ title: 'Transfer' }} />

	<Box className="flex-1 bg-background-900 px-6 pt-5">
	<VStack space="lg">
	  <Heading size="xl" className="text-center text-white">Transfer Assets</Heading>

	  <VStack space="sm">
	  {balances.map((asset, index) => {
	    const icon =
	      assetIconMap[(asset?.symbol || '').toLowerCase()] ??
	      assetIconMap['default'];

	    return (

			<Pressable
			  key={index}
			  onPress={() => {
			    console.log('[Pressable] TAPPED asset:', asset.symbol);
			    setRecipientAddress('');
			    setSelectedAsset(asset);
			    requestAnimationFrame(() => {
			      setModalVisible(true);
			    });
			  }}
			  style={({ pressed }) => [
			    {
			      backgroundColor: pressed
			        ? 'rgba(255,255,255,0.1)'
			        : 'rgba(255,255,255,0.05)',
			      borderRadius: 16,
			      marginBottom: 8,
			      paddingVertical: 8,
			      paddingHorizontal: 16,
			    },
			  ]}
			>
				<Card
				  variant="flat"
				  style={{
				    backgroundColor: 'rgba(255,255,255,0.05)',
				    borderRadius: 16,
				    paddingVertical: 8,
				    paddingHorizontal: 16,
				  }}
				>
				  <View pointerEvents="none">
				    <AssetListTile
				      asset={asset}
				      icon={icon}
				      subtitle={
				        <Text size="sm" color="textSecondary">
				          {asset.symbol} on {getChainNameById(asset.chainId)}
				        </Text>
				      }
				      trailing={
				        <Text size="md" weight="semibold">
				          {Number(asset.balance).toFixed(6)} {asset.symbol}
				        </Text>
				      }
				    />
				  </View>
				</Card>

			</Pressable>


	    );
	  })}






	  </VStack>
	</VStack>


    {modalVisible && (
		<Modal
		  visible={modalVisible}
		  transparent
		  animationType="slide"
		  onRequestClose={() => setModalVisible(false)}
		>
		  <KeyboardAvoidingView
		    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
		    style={{
		      flex: 1,
		      justifyContent: 'center',
		      backgroundColor: 'rgba(0, 0, 0, 0.8)',
		      padding: 24,
		    }}
		  >
		    <Box className="bg-background-900 rounded-xl p-6">
		      <Heading size="lg" className="text-white mb-4">
		        Enter recipient address
		      </Heading>

		      <TextInput
		        value={recipientAddress}
				onChangeText={(text) => {
				  setRecipientAddress(text);
				  if (addressError) setAddressError('');
				}}
		        placeholder="0x123...abcd"
		        placeholderTextColor="#888"
		        style={{
		          backgroundColor: '#1a1a1a',
		          padding: 12,
		          borderRadius: 12,
		          color: 'white',
		          marginBottom: 20,
		          borderWidth: 1,
		          borderColor: '#333',
		        }}
		      />
			  {addressError ? (
			    <Text size="sm" color="red" className="mb-3">
			      {addressError}
			    </Text>
			  ) : null}
			  
		      {/* ✅ Continue Button (styled) */}
		      <Button
		        className="mt-2 rounded-full"
		        style={{ height: 56 }}
		        disabled={!recipientAddress}
		        onPress={handleContinueToAmount}
		      >
		        <ButtonText className="text-lg text-white">Continue</ButtonText>
		      </Button>

		      {/* ✅ Cancel Button (styled) */}
		      <Button
		        variant="outline"
		        className="mt-3 rounded-full border-white"
		        style={{ height: 56, borderWidth: 0 }}
		        onPress={() => setModalVisible(false)}
		      >
		        <ButtonText className="text-lg text-white">Cancel</ButtonText>
		      </Button>
		    </Box>
		  </KeyboardAvoidingView>
		</Modal>
		)}

      </Box>
    </>
  );
};

export default Transfers;
