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
  walletId: string; // still received; used to pre-open sheet, but actions are routed to the right chain wallet
  isOpen: boolean;
  onClose: (refreshNeeded?: boolean) => void;
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
  // All assets from ALL chains (flattened)
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [togglingAssets, setTogglingAssets] = useState<Record<string, boolean>>({});
  const [preparingAssets, setPreparingAssets] = useState<Record<string, boolean>>({});
  const [showPreapprovalNotice, setShowPreapprovalNotice] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const chains = useChainStore.getState().chains;
  const screenWidth = Dimensions.get('window').width;

  // Map chainId -> walletId for chains the user has
  const userWallets = sessionStore.user?.wallets ?? [];
  const walletIdByChain: Record<string, string> = useMemo(() => {
    const map: Record<string, string> = {};
    userWallets.forEach((w: any) => {
      map[w.chainId] = w.id;
    });
    return map;
  }, [userWallets]);

  // Chain filter chips: default include all chains the user has a wallet for
  const [includedChains, setIncludedChains] = useState<Set<string>>(
    () => new Set(userWallets.map((w: any) => w.chainId))
  );


  useEffect(() => {
    let isMounted = true;

    const fetchAssets = async () => {
      if (!isOpen) return;

      try {
        setLoading(true);

        // Ensure chains list is populated
        if (!chains || chains.length === 0) {
          try {
            await useChainStore.getState().fetchChains();
          } catch (e) {
            console.warn('[ManageAssetsActionSheet] fetchChains failed:', e);
          }
        }

        // Fetch enabled assets per wallet (per chain where user has a wallet)
        const enabledByChain: Record<string, Set<string>> = {};
        await Promise.all(
          userWallets.map(async (w: any) => {
            try {
              const res = await api().get(`/wallets/${w.id}/assets`);
              enabledByChain[w.chainId] = new Set(
                (res.data ?? []).filter((a: any) => a?.isEnabled).map((a: any) => a.id)
              );
            } catch (e) {
              console.warn('[ManageAssetsActionSheet] enabled assets fetch failed for wallet', w.id, e);
              enabledByChain[w.chainId] = new Set<string>();
            }
          })
        );

        // Fetch assets for ALL chains (market)
        const allChainAssetsArrays = await Promise.all(
          chains.map(async (c: any) => {
            try {
              const res = await api().get(`/chains/${c.id}/assets`);
			  return (res.data ?? []).map((asset: any) => ({
			    ...asset,
			    assetId: asset.id,
			    chainId: c.id,
			    chainName: c.name ?? c.id,
			    // read default flag from API; fallback: native (no contract) is default
			    isDefault: Boolean(asset.isDefault || !asset.contractAddress),
			  }));

            } catch (e) {
              console.warn('[ManageAssetsActionSheet] chain assets fetch failed for chain', c.id, e);
              return [];
            }
          })
        );

        const mergedAll = ([] as any[]).concat(...allChainAssetsArrays);

        // Mark isEnabled if user has that chain and asset is enabled there
        const final = mergedAll.map((a: any) => ({
          ...a,
          isEnabled: enabledByChain[a.chainId]?.has?.(a.assetId) ?? false,
        }));

        // Filter out devOnly in production, same rule as before
        const prodEnv = process.env.PROD?.toUpperCase() === 'NO' ? 'NO' : 'YES';
        const isProd = prodEnv === 'YES';
        const filtered = final.filter((asset) => (isProd && asset.devOnly ? false : true));

        if (isMounted) setAssets(filtered);
      } catch (e) {
        console.error('[ManageAssetsActionSheet] Failed to load all assets:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAssets();
    return () => {
      isMounted = false;
    };
  }, [isOpen, chains?.length, userWallets.length]);




  const handleToggle = async (assetId: string) => {
    const asset = assets.find(a => a.assetId === assetId);
    if (!asset) return;

    const targetWalletId = walletIdByChain[asset.chainId];
    if (!targetWalletId) {
      Alert.alert(
        'Unavailable',
        `You don't have a wallet on ${asset.chainName}. Add this chain first to manage its assets.`
      );
      return;
    }

	// 🚫 Prevent disabling a default/native asset (from API; fallback: native without contract)
	const isDefaultAsset = Boolean(asset.isDefault || !asset.contractAddress);
	if (asset.isEnabled && isDefaultAsset) {
	  Alert.alert(
	    'Not allowed',
	    `${asset.name} is the default/native asset for this chain and cannot be disabled.`
	  );
	  return;
	}



    const action = asset.isEnabled ? 'disable' : 'enable';
    const confirmed = await confirmToggle(
      `Do you want to ${action} ${asset.name} in your ${asset.chainName} wallet?`
    );
    if (!confirmed) return;

    setTogglingAssets(prev => ({ ...prev, [assetId]: true }));

    const LONG_ENABLE_MS = 1200;
    let longEnableTimer: NodeJS.Timeout | null = null;
    if (action === 'enable') {
      longEnableTimer = setTimeout(() => {
        setPreparingAssets(prev => ({ ...prev, [assetId]: true }));
        setShowPreapprovalNotice(true);
      }, LONG_ENABLE_MS);
    }

    try {
      const res = await api().post(`/wallets/${targetWalletId}/assets/${assetId}/${action}`);
      setHasChanges(true);
      console.log(`[ManageAssetsActionSheet] ✅ API ${action} success`, res.data);

      setAssets(prev =>
        prev.map(a =>
          a.assetId === assetId ? { ...a, isEnabled: !a.isEnabled } : a
        )
      );

      if (action === 'enable' && preparingAssets[assetId]) {
        Alert.alert('Ready to use', `${asset.name} was enabled and pre-approved for faster payments.`);
      }
    } catch (err) {
      console.error(`[ManageAssetsActionSheet] ❌ Failed to ${action} ${asset.name}`, err);
      Alert.alert('Error', `Failed to ${action} ${asset.name}`);
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
	const icon =
	  assetIconMap[(asset?.symbol || '').toLowerCase()] ??
	  assetIconMap['default'];

    const isToggling = togglingAssets[asset.assetId] ?? false;
    const isPreparing = preparingAssets[asset.assetId] ?? false;

    const chainObj = chains.find((c: any) => c.id === asset.chainId);
    const chainIcon = chainObj?.icon;

    // Unavailable if user lacks a wallet on this chain
    const unavailable = !walletIdByChain[asset.chainId];

    // Default/native as reported by API (fallback: no contractAddress)
    const isDefault = Boolean(asset.isDefault || !asset.contractAddress);

    // Switch is disabled if:
    //  - toggling in progress
    //  - user has no wallet on this chain
    //  - the asset is default and currently ON (cannot disable)
    const disableSwitch = isToggling || unavailable || (asset.isEnabled && isDefault);

    // Stronger visuals when asset is disabled/off
    const off = !asset.isEnabled;
    const textPrimary = unavailable ? '#9ca3af' : off ? '#c4c4c4' : '#ffffff';
    const textSecondary = unavailable ? '#8b8b8b' : off ? '#9aa0a6' : '#bbbbbb';
    const cardBg = off ? '#101010' : '#141414';
    const cardBorder = off ? '#2a2a2a' : '#5c0420';

    return (
      <Box
        key={asset.assetId}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: cardBg,
          borderColor: asset.isEnabled ? cardBorder : '#2a2a2a',
          borderWidth: 1,
          borderRadius: 12,
          paddingVertical: 12,
          paddingHorizontal: 16,
          marginBottom: 10,
          marginHorizontal: 16,
          width: screenWidth - 60,
          opacity: unavailable ? 0.7 : 1,
        }}
      >
        <Box style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 1 }}>
          {/* Asset icon with chain icon overlaid (same style as Wallet Balances) */}
          <Box style={{ width: 48, height: 48, marginRight: 12, position: 'relative' }}>
            {icon && (
              <Image
                source={icon}
                style={{ width: 48, height: 48 }}
                resizeMode="contain"
              />
            )}
            {chainIcon && (
              <Image
                source={chainIcon}
                style={{
                  width: 22,
                  height: 22,
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  borderRadius: 7,
                }}
                resizeMode="contain"
              />
            )}
          </Box>

          <Box style={{ flexShrink: 1 }}>
            <Text style={{ color: textPrimary, fontSize: 16 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{asset.name}</Text> ({asset.symbol})
              {isDefault ? (
                <Text style={{ color: '#9aa0a6', fontSize: 12 }}></Text>
              ) : null}
            </Text>

            {/* Chain name line (between name and contract) */}
            <Text
              size="xs"
              style={{ color: textSecondary, marginTop: 2, fontSize: 12 }}
            >
              {asset.chainName}
            </Text>

            <Text
              size="xs"
              style={{ color: textSecondary, marginTop: 2, fontSize: 12 }}
            >
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
          disabled={disableSwitch}
          // darker track when OFF; slightly dim when disabled
          trackColor={{ false: disableSwitch ? '#2a2a2a' : '#3a3a3a', true: disableSwitch ? '#6f213f' : '#5c0420' }}
          // grey thumb when OFF or when disabled
          thumbColor={disableSwitch ? '#555' : asset.isEnabled ? '#fe0055' : '#777'}
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
		    style={{ marginLeft: 16, marginBottom: 8 }}
		  >
		    Manage assets
		  </Text>

		  {/* Chain filter chips (no "All"). Each chip shows the chain icon left of the name. */}
		  <ScrollView
		    horizontal
		    showsHorizontalScrollIndicator={false}
		    style={{ marginBottom: 12, paddingHorizontal: 12 }}
		    contentContainerStyle={{ paddingRight: 12 }}
		  >
		    {userWallets.map((w: any) => {
		      const c = chains.find((cc: any) => cc.id === w.chainId);
		      const isOn = includedChains.has(w.chainId);
		      const chainIcon = c?.icon;
		      return (
		        <Pressable
		          key={w.chainId}
		          onPress={() => {
		            setIncludedChains((prev) => {
		              const next = new Set(prev);
		              if (next.has(w.chainId)) next.delete(w.chainId);
		              else next.add(w.chainId);
		              return next;
		            });
		          }}
		          style={{
		            marginRight: 8,
		            paddingVertical: 6,
		            paddingHorizontal: 10,
		            borderRadius: 999,
		            backgroundColor: isOn ? '#fd0055' : '#202020',
		            borderWidth: 1,
		            borderColor: isOn ? '#fd0055' : '#333',
		            flexDirection: 'row',
		            alignItems: 'center',
		            opacity: isOn ? 1 : 0.6, // looks more disabled when OFF
		          }}
		        >
		          {chainIcon ? (
		            <Image
		              source={chainIcon}
		              style={{ width: 16, height: 16, marginRight: 6 }}
		              resizeMode="contain"
		            />
		          ) : null}
		          <Text
		            style={{
		              color: isOn ? '#fff' : '#9ca3af', // gray text when OFF
		              fontSize: 12,
		              fontWeight: '600',
		            }}
		          >
		            {c?.name ?? w.chainId}
		          </Text>
		        </Pressable>
		      );
		    })}
		  </ScrollView>


		  {assets.length === 0 && !loading && (
		    <Text style={{ color: '#888', textAlign: 'center', marginTop: 24 }}>
		      No assets available
		    </Text>
		  )}

		  {/* Flat list of ALL assets, filtered by includedChains */}
		  {assets
		    .filter((a) => includedChains.size === 0 || includedChains.has(a.chainId))
		    .map(renderCard)}

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
