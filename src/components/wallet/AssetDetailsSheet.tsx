import React, { useEffect, useState } from 'react';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '@/components/ui/actionsheet';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { Box } from '@/components/ui/box';
import { Pressable, Image, View, Alert } from 'react-native';
import { X } from 'lucide-react-native';
import { useChainStore } from '@/stores/ChainStore';
import { assetIconMap } from '@/utils/assetIcons';
import { api } from '@/services/emigro/api';
import { sessionStore } from '@/stores/SessionStore';
import { fetchPrimaryCurrency } from '@/services/emigro/userPrimaryCurrency';
import { updatePrimaryCurrency } from '@/services/emigro/userPrimaryCurrency';


type Props = {
  isOpen: boolean;
  onClose: () => void;
  asset: any | null;
  onPrimaryCurrencyChanged?: () => void;
};

export const AssetDetailsSheet = ({ isOpen, onClose, asset }: Props) => {
  const [fullAsset, setFullAsset] = useState<any | null>(null);
  const [isPrimary, setIsPrimary] = useState(false);
  const [quote, setQuote] = useState<number | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!asset?.assetId) {
        console.log('[AssetDetailsSheet] ⚠️ No assetId, skipping fetch.');
        return;
      }

      try {
        console.log('[AssetDetailsSheet] 🔁 Fetching asset details...');
        const res = await api().get(`/assets/${asset.assetId}`);
        console.log('[AssetDetailsSheet] 📦 Full asset data:', res.data);
        setFullAsset(res.data);

        console.log('[AssetDetailsSheet] 🔁 Fetching primary currency...');
        const primary = await fetchPrimaryCurrency();
        console.log('[AssetDetailsSheet] 🏦 User primary currency:', primary);

        setIsPrimary(primary?.assetId === asset.assetId);

        const fiat = sessionStore.preferences?.fiatsWithBank?.[0] ?? 'USD';
        console.log(`[AssetDetailsSheet] 🔁 Fetching quote for ${asset.symbol} -> ${fiat}...`);
        const quoteRes = await api().get(`/quote?asset=${asset.symbol}&fiat=${fiat}`);
        console.log('[AssetDetailsSheet] 💱 Quote response:', quoteRes.data);

        setQuote(parseFloat(quoteRes.data?.price) || null);
      } catch (e) {
        console.error('[AssetDetailsSheet] ❌ Failed to fetch data:', e);
      }
    };

    fetchDetails();
  }, [asset?.assetId]);

  if (!asset) return null;

  const icon =
    assetIconMap[(asset?.symbol || '').toLowerCase()] ??
    assetIconMap['default'];


  const chain = useChainStore.getState().getChainById(asset.chainId);
  const chainIcon = chain?.icon;

  const parsedBalance = parseFloat(asset.balance ?? '0');
  const displayBalance = parsedBalance.toFixed(10);

  const handleMakePrimary = () => {
    Alert.alert(
      'Make Primary?',
      `Would you like to make ${asset.name} your primary asset? Your fast payments will use this asset by default.`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            console.log(`[AssetDetailsSheet] ✅ Confirmed primary change for ${asset.name}`);

            const success = await updatePrimaryCurrency(
              asset.assetId,
              asset.chainId,
              asset.chainIdOnchain ?? fullAsset?.chainIdOnchain ?? 0
            );

			if (success) {
			  setIsPrimary(true);
			  onPrimaryCurrencyChanged?.();
			  onClose();
			} else {
			  Alert.alert('❌ Error', 'Failed to set primary asset. Please try again.');
			}
          },
        },
      ]
    );
  };

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

		<ScrollView
		  style={{ marginTop: 16, width: '100%' }}
		  contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80, flexGrow: 1 }}
		>
		  <Box style={{ alignItems: 'center', marginBottom: 20 }}>
		    <View style={{ width: 110, height: 110, position: 'relative', marginBottom: 24 }}>
		      {icon && (
		        <Image source={icon} style={{ width: 110, height: 110 }} resizeMode="contain" />
		      )}
		      {chainIcon && (
		        <Image
		          source={chainIcon}
		          style={{
		            width: 48,
		            height: 48,
		            position: 'absolute',
		            bottom: -4,
		            right: -4,
		            borderRadius: 15,
		          }}
		          resizeMode="contain"
		        />
		      )}
		    </View>

		    <View style={{ paddingHorizontal: 16, marginBottom: 0 }}>
		      <Text
		        style={{
		          color: '#fff',
		          fontSize: 28,
		          fontWeight: 'bold',
		          textAlign: 'center',
		          lineHeight: 34,
		          includeFontPadding: false,
		          textAlignVertical: 'center',
				  padding: 0,
				  margin: 0,
		        }}
		        allowFontScaling
		        numberOfLines={1}
		        adjustsFontSizeToFit
		        minimumFontScale={0.7}
		      >
		        {asset.symbol}
		      </Text>
		    </View>
		  </Box>

		  <View style={{ paddingHorizontal: 16, marginBottom: 12, marginTop: -20 }}>
		    <Text
		      style={{
		        color: '#fff',
		        fontSize: 26,
		        fontWeight: 'bold',
		        textAlign: 'center',
		        lineHeight: 32,
		        includeFontPadding: false,
		        textAlignVertical: 'center',
		      }}
		      allowFontScaling
		      numberOfLines={1}
		      adjustsFontSizeToFit
		      minimumFontScale={0.7}
		    >
		      {displayBalance}
		    </Text>
		    <Text
		      style={{
		        color: '#aaa',
		        fontSize: 18,
		        textAlign: 'center',
		        lineHeight: 24,
		      }}
		    >
		      ${asset.symbol}
		    </Text>
		  </View>

		  {!isPrimary && (
		    <Pressable
		      onPress={handleMakePrimary}
		      style={{
		        backgroundColor: '#fe0055',
		        paddingVertical: 12,
		        paddingHorizontal: 24,
		        borderRadius: 8,
		        alignSelf: 'center',
		        marginTop: 8,
		        marginBottom: 8,
		      }}
		    >
		      <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Make it primary</Text>
		    </Pressable>
		  )}

		  <View style={{ backgroundColor: '#1e1e1e', padding: 16, borderRadius: 12, marginTop: 16 }}>
		    <Text style={{ color: '#ccc', marginBottom: 5 }}>Chain: {chain?.name || asset.chainId}</Text>

		    {quote !== null && quote !== 0 && (
		      <Text style={{ color: '#ccc', marginBottom: 5 }}>
		        1 {sessionStore.preferences?.fiatsWithBank?.[0] ?? 'USD'} = {(1 / quote).toFixed(6)} {asset.symbol}
		      </Text>
		    )}

		    {fullAsset && (
		      <>
		        <Text style={{ color: '#aaa', marginBottom: 5 }}>Name: {fullAsset.name}</Text>
		        <Text style={{ color: '#aaa', marginBottom: 5 }}>Symbol: {fullAsset.symbol}</Text>
		        <Text style={{ color: '#aaa', marginBottom: 5 }}>
		          Contract Address:{' '}
		          {fullAsset.contractAddress
		            ? `${fullAsset.contractAddress.slice(0, 8)}...${fullAsset.contractAddress.slice(-8)}`
		            : 'Native'}
		        </Text>
		      </>
		    )}
		  </View>
		</ScrollView>

      </ActionsheetContent>
    </Actionsheet>
  );
};
