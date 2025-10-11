import React, { useEffect, useState, useMemo } from 'react';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '@/components/ui/actionsheet';
import { ScrollView } from '@/components/ui/scroll-view';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Box } from '@/components/ui/box';
import { Image, Switch, Pressable, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { assetIconMap } from '@/utils/assetIcons';
import { api } from '@/services/emigro/api';
import { sessionStore } from '@/stores/SessionStore';
import { useChainStore } from '@/stores/ChainStore';
import { observer } from 'mobx-react-lite';

type Props = {
  walletId: string;
  isOpen: boolean;
  onClose: () => void;
};

const confirmToggle = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    Alert.alert(
      'Confirm',
      message,
      [
        { text: 'Cancel', onPress: () => resolve(false), style: 'cancel' },
        { text: 'Yes', onPress: () => resolve(true) },
      ],
      { cancelable: true }
    );
  });
};

const ManageAssetsActionSheetComponent = ({ walletId, isOpen, onClose }: Props) => {
	const [assets, setAssets] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [togglingAssets, setTogglingAssets] = useState<Record<string, boolean>>({});
	// NEW: show “preparing / pre-approving” state if enabling takes longer
	const [preparingAssets, setPreparingAssets] = useState<Record<string, boolean>>({});
	// NEW: global notice to explain the first-time pre-approval
	const [showPreapprovalNotice, setShowPreapprovalNotice] = useState(false);

	const chains = useChainStore.getState().chains;
	const screenWidth = Dimensions.get('window').width;

	const [hasChanges, setHasChanges] = useState(false);


  const currentWallet = useMemo(() => {
    return sessionStore.user?.wallets?.find(w => w.id === walletId);
  }, [walletId]);

  const chain = useMemo(() => {
    return chains.find(c => c.id === currentWallet?.chainId);
  }, [chains, currentWallet]);

  useEffect(() => {
    let isMounted = true;

    const fetchAssets = async () => {
      if (!walletId || !isOpen) return;

      try {
        setLoading(true);
        const chainId = currentWallet?.chainId;
        if (!chainId) return;

        const [chainAssetsRes, enabledRes] = await Promise.all([
          api().get(`/chains/${chainId}/assets`),
          api().get(`/wallets/${walletId}/assets`)
        ]);

        console.log('[ComponentsWallet][ManageAssetsActionSheet] ✅ /chains/:id/assets response:', chainAssetsRes.data);
        console.log('[ComponentsWallet][ManageAssetsActionSheet] ✅ /wallets/:id/assets response:', enabledRes.data);

        const enabledAssetsMap = new Map(
          enabledRes.data.map((a: any) => [a.id, a])
        );

        const mergedAssets = chainAssetsRes.data.map((asset: any) => {
          const enabledAsset = enabledAssetsMap.get(asset.id);
          return {
            ...asset,
            assetId: asset.id,
            isEnabled: enabledAsset?.isEnabled ?? false,
          };
        });

        const prodEnv = process.env.PROD?.toUpperCase() === 'NO' ? 'NO' : 'YES';
        const isProd = prodEnv === 'YES';
        console.log(`[ComponentsWallet][ManageAssetsActionSheet] 🌐 Environment: PROD=${prodEnv} (interpreted as ${isProd ? 'production' : 'development'})`);

        const filteredAssets = mergedAssets.filter(asset => {
          if (isProd && asset.devOnly) {
            console.log(`[ComponentsWallet][ManageAssetsActionSheet] 🚫 Filtering out dev-only asset: ${asset.symbol} (${asset.name})`);
            return false;
          }
          return true;
        });

        console.log('[ComponentsWallet][ManageAssetsActionSheet] 🔁 Final filtered asset list:', filteredAssets);

        if (isMounted) setAssets(filteredAssets);
      } catch (e) {
        console.error('[ComponentsWallet][ManageAssetsActionSheet] 🔥 [ManageAssets] Failed to load:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAssets();
    return () => {
      isMounted = false;
      console.log('[ComponentsWallet][ManageAssetsActionSheet] 🔙 Cleanup: ManageAssetsActionSheet unmounted');
    };
  }, [walletId, isOpen]);



  const handleToggle = async (assetId: string) => {
    const asset = assets.find(a => a.assetId === assetId);
    if (!asset) return;

    // 🚫 Prevent disabling the default asset
    const isDefaultAsset =
      asset.assetId === '1e90df0a-2920-11f0-8f36-02ee245cdcb3' &&
      asset.chainId === '05c65d14-291c-11f0-8f36-02ee245cdcb3';

    if (isDefaultAsset && asset.isEnabled) {
      Alert.alert(
        'Not allowed',
        `${asset.name} is the default asset for this wallet and cannot be disabled.`
      );
      return;
    }

    const action = asset.isEnabled ? 'disable' : 'enable';
    console.log(
      `[ComponentsWallet][ManageAssetsActionSheet] 🟢 Toggle request for ${asset.name} (${action})`
    );

    const confirmed = await confirmToggle(
      `Do you want to ${action} ${asset.name} in your ${chain?.name} wallet?`
    );
    if (!confirmed) return;

    setTogglingAssets(prev => ({ ...prev, [assetId]: true }));

    // If enabling takes longer than this threshold, show a subtle “preparing” state
    const LONG_ENABLE_MS = 1200;
    let longEnableTimer: NodeJS.Timeout | null = null;

    if (action === 'enable') {
      longEnableTimer = setTimeout(() => {
        setPreparingAssets(prev => ({ ...prev, [assetId]: true }));
        setShowPreapprovalNotice(true);
      }, LONG_ENABLE_MS);
    }

    try {
      const res = await api().post(`/wallets/${walletId}/assets/${assetId}/${action}`);
      setHasChanges(true);
      console.log(`[ComponentsWallet][ManageAssetsActionSheet] ✅ API ${action} success`, res.data);

      setAssets(prev =>
        prev.map(a =>
          a.assetId === assetId ? { ...a, isEnabled: !a.isEnabled } : a
        )
      );

      // Small, friendly info when enabling succeeds and we showed “preparing”
      if (action === 'enable' && preparingAssets[assetId]) {
        Alert.alert(
          'Ready to use',
          `${asset.name} was enabled and pre-approved for faster payments.`
        );
      }
    } catch (err) {
      console.error(
        `[ComponentsWallet][ManageAssetsActionSheet] ❌ Failed to ${action} ${asset.name}`,
        err
      );
      Alert.alert(
        '[ComponentsWallet][ManageAssetsActionSheet] Error',
        `Failed to ${action} ${asset.name}`
      );
    } finally {
      if (longEnableTimer) clearTimeout(longEnableTimer);
      setTogglingAssets(prev => ({ ...prev, [assetId]: false }));
      setPreparingAssets(prev => {
        const copy = { ...prev };
        delete copy[assetId];
        return copy;
      });
    }
  };


  const renderCard = (asset: any) => {
    const icon = assetIconMap[asset.symbol?.toLowerCase()] ?? null;
    const isToggling = togglingAssets[asset.assetId] ?? false;
    const isPreparing = preparingAssets[asset.assetId] ?? false;

    return (
      <Box
        key={asset.assetId}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#141414',
          borderColor: asset.isEnabled ? '#5c0420' : '#3c3c3c',
          borderWidth: 1,
          borderRadius: 12,
          paddingVertical: 12,
          paddingHorizontal: 16,
          marginBottom: 10,
          marginHorizontal: 16,
          width: screenWidth - 60,
        }}
      >
        <Box style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 1 }}>
          {icon && (
            <Image
              source={icon}
              style={{ width: 42, height: 42, resizeMode: 'contain', marginRight: 12 }}
            />
          )}
          <Box style={{ flexShrink: 1 }}>
            <Text style={{ color: '#fff', fontSize: 16 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{asset.name}</Text> ({asset.symbol})
            </Text>
            <Text size="xs" style={{ color: '#aaa', marginTop: 2, fontSize: 12 }}>
              {asset.contractAddress?.trim()
                ? `${asset.contractAddress.slice(0, 9)}...${asset.contractAddress.slice(-7)}`
                : 'Native'}
            </Text>
            {isPreparing && (
              <Box style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                <ActivityIndicator size="small" />
                <Text size="xs" style={{ color: '#aaa', marginLeft: 8 }}>
                  Preparing for first use… (one-time token approval)
                </Text>
              </Box>
            )}
          </Box>
        </Box>

        <Switch
          value={asset.isEnabled}
          onValueChange={() => handleToggle(asset.assetId)}
          disabled={isToggling}
          trackColor={{ false: '#555', true: '#555' }}
          thumbColor={asset.isEnabled ? '#fe0055' : '#ccc'}
        />
      </Box>
    );
  };


  return (
	<Actionsheet
	  isOpen={isOpen}
	  onClose={() => {
	    console.log('[ManageAssetsActionSheet] 🛑 Dismissed. hasChanges:', hasChanges);
	    onClose(hasChanges); // Pass back change state no matter how it closed
	    setHasChanges(false); // Reset for next use
	  }}
	>
      <ActionsheetBackdrop />
      <ActionsheetContent
        style={{
          maxHeight: '85%',
          backgroundColor: '#0a0a0a',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingTop: 12,
          paddingHorizontal: 16,
        }}
      >
        {/* Close Button */}
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
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: '600' }}>×</Text>
        </Pressable>

        {/* Drag Indicator */}
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

        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 40,
            paddingTop: 16,
          }}
        >
          <Box>
            <Text
              size="xl"
              weight="semibold"
              style={{ marginLeft: 16, marginBottom: 12 }}
            >
              {chain?.name ?? 'Assets'}
            </Text>

            {assets.length === 0 && !loading && (
              <Text style={{ color: '#888', textAlign: 'center', marginTop: 24 }}>
                No assets available
              </Text>
            )}

            {assets.map(renderCard)}
			{showPreapprovalNotice && (
			  <Box
			    style={{
			      marginHorizontal: 16,
			      marginBottom: 10,
			      backgroundColor: '#171717',
			      borderColor: '#333',
			      borderWidth: 1,
			      borderRadius: 12,
			      paddingVertical: 10,
			      paddingHorizontal: 12,
			    }}
			  >
			    <Text style={{ color: '#ddd', fontSize: 12 }}>
			      Enabling an asset may take a few seconds the first time while we prepare it for
			      instant payments. This is a one-time approval and won’t be needed again.
			    </Text>
			  </Box>
			)}

          </Box>
        </ScrollView>
      </ActionsheetContent>
    </Actionsheet>
  );
};

export const ManageAssetsActionSheet = observer(ManageAssetsActionSheetComponent);
