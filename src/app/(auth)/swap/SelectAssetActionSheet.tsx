import React, { useEffect, useState, useMemo } from 'react';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '@/components/ui/actionsheet';
import { ScrollView } from '@/components/ui/scroll-view';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Image, Pressable, Dimensions, ActivityIndicator } from 'react-native';

import { sessionStore } from '@/stores/SessionStore';
import { useChainStore } from '@/stores/ChainStore';
import { assetIconMap } from '@/utils/assetIcons';
import { api } from '@/services/emigro/api';

type Props = {
  walletId: string;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (asset: any) => void;
};

export const SelectAssetActionSheet = ({ walletId, isOpen, onClose, onSelect }: Props) => {
  const screenWidth = Dimensions.get('window').width;
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const currentWallet = useMemo(() => {
    return sessionStore.user?.wallets?.find(w => w.id === walletId);
  }, [walletId]);

  const chains = useChainStore.getState().chains;
  const chain = useMemo(() => chains.find(c => c.id === currentWallet?.chainId), [chains, currentWallet]);

  useEffect(() => {
    const fetch = async () => {
      if (!walletId || !isOpen) return;
      try {
        setLoading(true);
        const res = await api().get(`/wallets/${walletId}/assets`);
        const prod = process.env.PROD?.toUpperCase() !== 'NO';
        const filtered = res.data.filter(
          (a: any) =>
            a.isEnabled &&
            (!prod || !a.devOnly)
        );
        setAssets(filtered);
      } catch (err) {
        console.error('[SelectAssetActionSheet] Failed to load assets', err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [walletId, isOpen]);

  const renderAsset = (asset: any) => {
    const icon = assetIconMap[asset.symbol?.toLowerCase()] ?? null;

    return (
      <Pressable
        onPress={() => {
          onSelect(asset);
          onClose();
        }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#141414',
          padding: 12,
          borderRadius: 12,
          borderColor: '#333',
          borderWidth: 1,
          marginBottom: 10,
          width: screenWidth - 60,
          alignSelf: 'center',
        }}
      >
        {icon && (
          <Image
            source={icon}
            style={{ width: 28, height: 28, marginRight: 12, resizeMode: 'contain' }}
          />
        )}
        <Box>
          <Text style={{ color: 'white', fontSize: 16 }}>{asset.name} ({asset.symbol})</Text>
          <Text style={{ color: '#aaa', fontSize: 12, marginTop: 2 }}>
            {asset.contractAddress
              ? `${asset.contractAddress.slice(0, 6)}...${asset.contractAddress.slice(-4)}`
              : 'Native'}
          </Text>
        </Box>
      </Pressable>
    );
  };

  return (
    <Actionsheet isOpen={isOpen} onClose={onClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent
        style={{
          backgroundColor: '#0a0a0a',
          paddingHorizontal: 16,
          paddingTop: 12,
          maxHeight: '80%',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        }}
      >
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator
            style={{
              backgroundColor: '#555',
              height: 6,
              width: 60,
              borderRadius: 3,
              marginBottom: 16,
            }}
          />
        </ActionsheetDragIndicatorWrapper>

        <Text style={{ color: '#fff', fontSize: 18, marginBottom: 12, textAlign: 'center' }}>
          Select {chain?.name} Asset
        </Text>

		{loading ? (
		  <Box style={{ alignItems: 'center', paddingVertical: 24 }}>
		    <ActivityIndicator size="small" />
		    <Text style={{ color: '#888', marginTop: 8 }}>
		      Loading currencies...
		    </Text>
		  </Box>
		) : (
		  <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
		    {assets.map(asset => (
		      <React.Fragment key={asset.assetId}>
		        {renderAsset(asset)}
		      </React.Fragment>
		    ))}

		    {!assets.length && (
		      <Text style={{ color: '#888', textAlign: 'center', marginTop: 20 }}>
		        No assets available
		      </Text>
		    )}
		  </ScrollView>
		)}

      </ActionsheetContent>
    </Actionsheet>
  );
};
