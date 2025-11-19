// src/app/(auth)/swap/index.tsx

import React, { useEffect, useRef, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import {
  TextInput,
  Pressable,
  Image,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';

import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

import { CryptoAsset } from '@/types/assets';
import { balanceStore } from '@/stores/BalanceStore';
import { swapStore as bloc } from '@/stores/SwapStore';
import { fetchQuote as fetchQuoteFromApi } from '@/services/emigro/quotes';
import { assetIconMap } from '@/utils/assetIcons';

import { chainIconMap } from '@/utils/chainIconMap';
import { useChainStore } from '@/stores/ChainStore';
import { sessionStore } from '@/stores/SessionStore';
import { SelectAssetActionSheet } from './SelectAssetActionSheet';

import { fetchUniswapQuote } from '@/services/emigro/uniswap';
import { toBaseUnits } from '@/utils/token.utils';
import { backendUrl } from '@/services/emigro/api';


const getAssetIcon = (asset: string | { symbol?: string } | null | undefined) => {
  const symbol =
    typeof asset === 'string'
      ? asset
      : typeof asset?.symbol === 'string'
      ? asset.symbol
      : undefined;

  if (!symbol) return require('@/assets/images/icons/default.png');
  return assetIconMap[symbol.toLowerCase()] || require('@/assets/images/icons/default.png');
};

const Swap = () => {
  const router = useRouter();
  const assets: CryptoAsset[] = balanceStore.currentAssets();

  const [sellAsset, setSellAsset] = useState<CryptoAsset>(CryptoAsset.USDC);
  const [buyAsset, setBuyAsset] = useState<CryptoAsset | null>(null); // <-- updated
  const [sellValue, setSellValue] = useState('');
  const [buyValue, setBuyValue] = useState('');
  const [rate, setRate] = useState<number | null>(null);
  const [fetchingRate, setFetchingRate] = useState(false);

  const inputRef = useRef<TextInput>(null);
  
  const { user } = sessionStore;
  const wallets = user?.wallets ?? [];
  const chains = useChainStore((state) => state.chains);

  const [selectedWalletId, setSelectedWalletId] = useState(wallets[0]?.id ?? null);
  
  const [isAssetSheetOpen, setIsAssetSheetOpen] = useState(false);
  const [selectingSellAsset, setSelectingSellAsset] = useState(true);
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [sellAssetBalance, setSellAssetBalance] = useState<number>(0);
  const [buyAssetBalance, setBuyAssetBalance] = useState<number>(0);
  const exceedsBalance = Number(sellValue || 0) > sellAssetBalance;
  
  const [lastQuote, setLastQuote] = useState<any | null>(null);
  
  const priceImpact = Number(lastQuote?.priceImpactPercent);
  const hasValidImpact = Number.isFinite(priceImpact);

  const formatRouterName = (routerType: string) => {
    const normalized = routerType?.toLowerCase().replace(/\s/g, '').replace(/v(\d)/, '-v$1'); // normalize formats like "uniswapv3"

    const nameMap: Record<string, string> = {
      'uniswap-v2': 'Uniswap V2',
      'uniswap-v3': 'Uniswap V3',
      'uniswapv2': 'Uniswap V2',
      'uniswapv3': 'Uniswap V3',
      'aerodrome': 'Aerodrome',
	  'aerodrome-slipstream': 'Aerodrome',
      'camelot': 'Camelot',
      'sushiswap': 'SushiSwap',
    };

    return nameMap[normalized] || 'Unknown';
  };
  
  const isSwapDisabled =
    fetchingRate ||
    !sellValue ||
    Number(sellValue) <= 0 ||
    !buyAsset ||
    sellAsset?.assetId === buyAsset?.assetId ||
    !buyValue ||
    exceedsBalance;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sanitizeAsset = (a: any) => ({
    assetId: a.assetId ?? a.id ?? '',
    symbol: a.symbol ?? '',
    decimals: a.decimals ?? 6,
    name: a.name ?? '',
    contractAddress: a.contractAddress ?? a.address ?? '',
    ...a,
  });
    
  /**
   * Ensure a wallet is selected for the given chain and set the default asset (You Pay).
   * - picks the user's wallet that belongs to the given chain
   * - fetches /chains/:id/assets and selects the asset with isDefault === true
   * - falls back to the first wallet balance if no default asset is marked
   */
  const selectDefaultForChain = async (chainId: string) => {
    try {
      // pick wallet on this chain
      const walletOnChain = wallets.find((w) => w.chainId === chainId);
      if (!walletOnChain) {
        console.warn('[swap][index] No wallet found for chainId:', chainId);
        return;
      }

      // ensure balances exist for that wallet (for fallback)
      const maybeBalances = balanceStore.walletBalances[walletOnChain.id];
      if (!maybeBalances) {
        await balanceStore.fetchWalletBalance(walletOnChain.id, { force: true });
      }

      setSelectedWalletId(walletOnChain.id);

      // fetch chain assets to locate default
      const res = await fetch(`${backendUrl}/chains/${chainId}/assets`);
      const assets = await res.json();

      // prefer asset with isDefault === true
      const defaultAsset = assets.find((a: any) => a?.isDefault === true);
      if (defaultAsset) {
        setSellAsset(sanitizeAsset(defaultAsset));
        return;
      }

      // fallback: first balance found on wallet
      const balances = balanceStore.walletBalances[walletOnChain.id] ?? [];
      if (balances.length > 0) {
        setSellAsset(sanitizeAsset(balances[0]));
        return;
      }

      // last resort: clear
      setSellAsset(null);
    } catch (e) {
      console.warn('[swap][index] selectDefaultForChain error:', e);
    }
  };

  const fetchQuote = async (retry = 0): Promise<void> => {
    const parsedValue = Number(sellValue);
    const isValid =
      parsedValue > 0 &&
      sellAsset?.contractAddress &&
      buyAsset?.contractAddress &&
      selectedWalletId;

    if (!isValid) {
      console.warn('[swap index][fetchQuote] ⚠️ Skipping fetch due to invalid input', {
        sellValue,
        sellAsset,
        buyAsset,
        selectedWalletId,
      });
      return;
    }

    const selectedWallet = wallets.find(w => w.id === selectedWalletId);
    const chain = chains.find(c => c.id === selectedWallet?.chainId);
    const chainId = Number(chain?.chainId);

    if (!chainId) {
      console.error('[swap index][fetchQuote] ❌ Missing or invalid chainId', {
        selectedWalletId,
        wallet: selectedWallet,
        chain,
      });
      return;
    }

    const fromToken = sellAsset.contractAddress;
    const toToken = buyAsset.contractAddress;

    const payload = {
      fromTokenAddress: fromToken,
      toTokenAddress: toToken,
      amount: sellValue,
      chainId,
      slippage: 0.75,
    };

    try {
      console.log('[swap index][fetchQuote] 📤 Sending quote request', {
        payload,
        sellAsset: {
          symbol: sellAsset.symbol,
          decimals: sellAsset.decimals,
        },
        buyAsset: {
          symbol: buyAsset.symbol,
          decimals: buyAsset.decimals,
        },
        chain,
      });

      setFetchingRate(true);

      // 🔐 Make sure you're calling the correct imported fetchQuote
      const response = await fetchQuoteFromApi(payload); // renamed to avoid self-calling

	  if (!response) {
	    console.warn('[swap index][fetchQuote] ❌ Quote returned null/undefined from API');
	    setBuyValue('');
	    setRate(null);
	    setErrorMessage('Could not fetch quote. Try again.');
	    return;
	  }


      const estimatedAmount = parseFloat(response.estimatedAmount);
      const calculatedRate = parsedValue / estimatedAmount;

      console.log('[swap index][fetchQuote] ✅ Quote received', {
        response,
        estimatedAmount,
        calculatedRate,
      });

      setBuyValue(estimatedAmount.toFixed(6));
      setRate(calculatedRate);
	  setLastQuote(response);
      setErrorMessage(null);
    } catch (err) {
      console.error(`[swap index][fetchQuote] ❌ Error on attempt ${retry + 1}:`, err);



      setBuyValue('');
      setRate(null);
      setErrorMessage('Currently, there is no swap available for this pair.');
    } finally {
      setFetchingRate(false);
    }
  };





  // Fetch once on mount with interval
  useFocusEffect(
    useCallback(() => {
      const interval = setInterval(() => {
        fetchQuote();
      }, 20000);

      return () => {
        console.log('[swap index] 🔁 Clearing interval on blur');
        clearInterval(interval);
      };
    }, [sellAsset, buyAsset, sellValue])
  );







  const handleSwitch = () => {
    const newSellAsset = buyAsset ?? null;
    const newBuyAsset = sellAsset ?? null;

    setSellAsset(newSellAsset);
    setBuyAsset(newBuyAsset);

    setSellValue('');
    setBuyValue('');
    setRate(null);
	setErrorMessage(null);

    setTimeout(() => inputRef.current?.focus(), 50);
  };


  const handleReview = () => {
    if (!buyAsset || !selectedWalletId) {
      console.warn('[swap index][handleReview] ❌ Missing buyAsset or selectedWalletId');
      return;
    }

    const amountIn = toBaseUnits(sellValue, sellAsset.decimals ?? 6);

    const tokenIn = sellAsset.contractAddress || sellAsset.address || sellAsset.tokenAddress;
    const tokenOut = buyAsset.contractAddress || buyAsset.address || buyAsset.tokenAddress;

    const selectedWallet = wallets.find(w => w.id === selectedWalletId);
    const chain = chains.find(c => c.id === selectedWallet?.chainId);
    const chainId = chain?.id;

    if (!tokenIn || !tokenOut) {
      console.error('[swap index][handleReview] ❌ Missing tokenIn or tokenOut', {
        tokenIn,
        tokenOut,
      });
      setErrorMessage('Missing token information.');
      return;
    }

    if (!chainId) {
      console.error('[swap index][handleReview] ❌ Missing chainId:', chainId);
      setErrorMessage('Invalid chain ID for selected wallet.');
      return;
    }

    if (!lastQuote) {
      console.error('[swap index][handleReview] ❌ Missing lastQuote');
      setErrorMessage('Missing quote information.');
      return;
    }

    console.log('[swap index][handleReview] ✅ Pushing to /swap/status with full quote:', {
      walletId: selectedWalletId,
      chainId,
      tokenIn,
      tokenOut,
      amountIn,
      quote: lastQuote,
    });

    router.push({
      pathname: '/swap/status',
      params: {
        walletId: selectedWalletId,
        chainId,
        tokenIn,
        tokenOut,
        amountIn,
        quote: JSON.stringify(lastQuote),
      },
    });
  };





  useEffect(() => {
    // On mount (and when chains/wallets update), auto-select the system default chain + its default asset.
    try {
      const getDefaultChain = useChainStore.getState().getDefaultChain;
      const def = typeof getDefaultChain === 'function' ? getDefaultChain() : null;

      if (def?.id) {
        selectDefaultForChain(def.id);
      } else if (wallets.length > 0 && chains.length > 0) {
        // Fallback: use the first wallet's chain if no default chain is marked
        const firstWalletChainId = wallets[0].chainId;
        if (firstWalletChainId) {
          selectDefaultForChain(firstWalletChainId);
        }
      }
    } catch (e) {
      console.warn('[swap][index] default chain/asset bootstrap error:', e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallets, chains]);




  
  
  useEffect(() => {
    if (!sellAsset?.assetId || !selectedWalletId) {
      console.warn('[swap][index] Skipping sellAsset balance: missing assetId or walletId');
      setSellAssetBalance(0);
      return;
    }

    const balances = balanceStore.walletBalances[selectedWalletId] ?? [];
    console.log('[swap][index] Checking sellAsset balance for:', sellAsset.assetId, sellAsset.symbol);
    console.log('[swap][index] Wallet balances:', balances);

    const match = balances.find(b => b.assetId === sellAsset.assetId);

    if (!match) {
      console.warn('[swap][index] ❌ No match found for sellAsset:', sellAsset.assetId);
    }

    const rawBalance = match?.balance ?? '0';
    const humanReadable = Number(rawBalance);

    console.log(`[swap][index] ✅ Computed sellAsset balance: ${humanReadable} ${sellAsset.symbol}`);
    setSellAssetBalance(humanReadable);
  }, [sellAsset, selectedWalletId, balanceStore.walletBalances]);
  useEffect(() => {
    if (!buyAsset?.assetId || !selectedWalletId) {
      console.warn('[swap][index] Skipping buyAsset balance: missing assetId or walletId');
      setBuyAssetBalance(0);
      return;
    }

    const balances = balanceStore.walletBalances[selectedWalletId] ?? [];
    console.log('[swap][index] Checking buyAsset balance for:', buyAsset.assetId, buyAsset.symbol);
    console.log('[swap][index] Wallet balances:', balances);

    const match = balances.find(b => b.assetId === buyAsset.assetId);

    if (!match) {
      console.warn('[swap][index] ❌ No match found for buyAsset:', buyAsset.assetId);
    }

    const rawBalance = match?.balance ?? '0';
    const humanReadable = Number(rawBalance);

    console.log(`[swap][index] ✅ Computed buyAsset balance: ${humanReadable} ${buyAsset.symbol}`);
    setBuyAssetBalance(humanReadable);
  }, [buyAsset, selectedWalletId, balanceStore.walletBalances]);



  
  


  const handleChainChange = (walletId: string) => {
    setSelectedWalletId(walletId);
    // Reset on chain change
    setSellAsset(null);
    setBuyAsset(null);
    setSellValue('');
    setBuyValue('');
    setRate(null);

    // Determine chainId (UUID) from wallet and set default asset for that chain
    const selectedWallet = wallets.find((w) => w.id === walletId);
    const chainUuid = selectedWallet?.chainId;
    if (chainUuid) {
      // fire and forget; it will set the sellAsset when fetched
      selectDefaultForChain(chainUuid);
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
    return (
      <Pressable
        key={value}
        onPress={() => onSelect(value)}
        style={{
          borderWidth: 2,
          borderColor: isSelected ? '#ff4d4d' : '#3c3c3c',
          backgroundColor: isSelected ? '#fe0055' : '#2e2e2e',
          borderRadius: 12,
          paddingVertical: 8,
          paddingHorizontal: 12,
          flexDirection: 'row',
          alignItems: 'center',
          marginRight: 8,
        }}
      >
        {iconSrc && (
          <Image
            source={iconSrc}
            style={{ width: 18, height: 18, marginRight: 6 }}
          />
        )}
        <Text style={{ color: '#fff', fontSize: 14 }}>
          {(displayLabel ?? value).toUpperCase()}
        </Text>
      </Pressable>
    );
  };
  
  useEffect(() => {
    const parsed = Number(sellValue);

    if (
      !isNaN(parsed) &&
      parsed > 0 &&
      sellAsset?.assetId &&
      (buyAsset?.assetId || buyAsset?.id) &&
      sellAsset.assetId !== (buyAsset?.assetId ?? buyAsset?.id)
    ) {
      setErrorMessage(null); // ✅ Clear error before new quote attempt
      fetchQuote();
    }
  }, [sellValue, sellAsset, buyAsset]);


  
  return (
    <>
      <Stack.Screen options={{ title: 'Swap' }} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <Box className="flex-1 bg-[#141414] pt-6 px-4">
		  
		  <HStack className="items-center justify-between mb-4" style={{ paddingHorizontal: 16 }}>
		    {/* Left arrow */}
		    <Pressable onPress={() => {/* Scroll left handler */}}>
		      <Text style={{ color: 'white', fontSize: 18 }}>{'<'}</Text>
		    </Pressable>

		    {/* Scrollable chain selector */}
		    <ScrollView
		      horizontal
		      showsHorizontalScrollIndicator={false}
		      contentContainerStyle={{ paddingHorizontal: 8 }}
		      style={{ flex: 1, marginHorizontal: 8 }}
		    >
		      <HStack space="sm">
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
		    </ScrollView>

		    {/* Fixed gear icon */}
		    {/*<View style={{ width: 32, alignItems: 'flex-end' }}>
		      <Pressable onPress={() => console.log('Open settings')}>
		        <Image
		          source={require('@/assets/images/icons/gear.png')}
		          style={{ width: 20, height: 20, tintColor: 'white' }}
		        />
		      </Pressable>
		    </View>*/}
		  </HStack>
		  
            <VStack>
              {/* Input Container */}
              <Box className="bg-[#2e2e2e] rounded-2xl p-4">
			  <HStack justify="between" align="center" style={{ marginBottom: 8, width: '100%', minHeight: 28 }}>
			    <View style={{ justifyContent: 'center' }}>
			      <Text
			        className="text-white text-base"
			        style={{
			          includeFontPadding: false,
			          textAlignVertical: 'center',
			          lineHeight: 20,
			        }}
			      >
			        You Pay
			      </Text>
			    </View>

			    <HStack space="sm" style={{ marginLeft: 'auto', alignItems: 'center' }}>
			      {([1, 0.5, 0.25] as const).map((p) => {
			        const decimals = Math.min(Number(sellAsset?.decimals ?? 6), 18);
			        const raw = sellAssetBalance * p;
			        const amount = Number.isFinite(raw) ? raw.toFixed(decimals) : '0';
			        const label = p === 1 ? '100%' : p === 0.5 ? '50%' : '25%';

			        return (
			          <Pressable
			            key={label}
			            onPress={() => {
			              const cleaned = amount.replace(/\.?0+$/, '');
			              setSellValue(cleaned);
			            }}
			            style={{
			              backgroundColor: '#1a1a1a',
			              paddingVertical: 6,
			              paddingHorizontal: 10,
			              borderRadius: 999,
			              borderWidth: 1,
			              borderColor: '#333',
			              alignItems: 'center',
			              justifyContent: 'center',
			              minHeight: 28,
			            }}
			          >
			            <Text className="text-white text-sm">{label}</Text>
			          </Pressable>
			        );
			      })}
			    </HStack>
			  </HStack>



                <HStack justify="between" align="center">
                  <TextInput
                    ref={inputRef}
                    autoFocus
					className={`text-[36px] font-semibold flex-1 ${exceedsBalance ? 'text-red-500' : 'text-white'}`}
                    placeholder="0"
                    placeholderTextColor="#666"
                    keyboardType="decimal-pad"
                    value={sellValue}
                    onChangeText={setSellValue}
                  />
				  <Pressable
				    className="flex-row items-center bg-[#1a1a1a] px-4 rounded-full ml-3"
				    style={{
				      minWidth: 100,
				      height: 40,
				      alignSelf: 'center',
				    }}
				    onPress={() => {
				      setSelectingSellAsset(true);
				      setIsAssetSheetOpen(true);
				    }}
				  >
				    <Image
				      source={getAssetIcon(sellAsset)}
				      style={{ width: 24, height: 24, marginRight: 6 }}
				    />
				    <Text className="text-white mr-1">{sellAsset?.symbol ?? 'Select asset'}</Text>
				    <Text className="text-white text-lg">˅</Text>
				  </Pressable>

				  
                </HStack>
				<Text
				  className="text-sm mt-2"
				  style={{ color: exceedsBalance ? '#ff4d4d' : '#999' }}
				>
				  Balance: {sellAssetBalance.toFixed(6)} {sellAsset?.symbol}
				</Text>


              </Box>

              {/* Swap button overlapping */}
			  <View className="items-center -mt-6 z-10">
			    <Pressable
			      onPress={handleSwitch}
			      className="w-16 h-16 rounded-full items-center justify-center"
			      style={{
			        backgroundColor: '#fe0055',
			        borderColor: '#141414',
			        borderWidth: 6,
					paddingBottom: 5
			      }}
			    >
			      <Text className="text-white text-3xl">⇅</Text>
			    </Pressable>
			  </View>

              {/* Output Container */}
              <Box className="bg-[#2e2e2e] rounded-2xl p-4 mt-[-26px]">
                <Text className="text-white mb-1">You Receive</Text>
                <HStack justify="between" align="center">
				<ScrollView horizontal showsHorizontalScrollIndicator={false}>
				  <TextInput
				    className="text-white text-[36px] font-semibold"
				    style={{ textAlign: 'left', minWidth: 200 }}
				    placeholder="0"
				    placeholderTextColor="#666"
				    keyboardType="decimal-pad"
				    value={buyValue}
				    editable={false}
				  />
				</ScrollView>
				<Pressable
				  className="flex-row items-center bg-[#1a1a1a] px-4 rounded-full ml-3"
				  style={{
				    minWidth: 100,
				    height: 40,
				    alignSelf: 'center',
				  }}
				  onPress={() => {
				    setSelectingSellAsset(false);
				    setIsAssetSheetOpen(true);
				  }}
				>
				  <Image
				    source={getAssetIcon(buyAsset)}
				    style={{ width: 24, height: 24, marginRight: 6 }}
				  />
				  <Text className="text-white mr-1">
				    {buyAsset?.symbol ?? 'Select asset'}
				  </Text>
				  <Text className="text-white text-lg">˅</Text>
				</Pressable>

                </HStack>
				<Text
				  className="text-sm mt-2"
				  style={{ color: '#999' }}
				>
				  Balance: {buyAssetBalance.toFixed(6)} {buyAsset?.symbol}
				</Text>
              </Box>

			  
			  {/* Review Button */}
			  <Button
			    disabled={isSwapDisabled}
			    onPress={handleReview}
			    className="mt-6 rounded-full"
			    style={{ backgroundColor: '#fe0055', height: 56 }}
			  >
			    <ButtonText className="text-lg text-white">
			      {fetchingRate ? 'Quoting...' : 'Swap'}
			    </ButtonText>
			  </Button>
			  
              {/* Price info */}
			  {rate && buyAsset && lastQuote && (
			    <View style={{ marginTop: 16, paddingHorizontal: 12 }}>
			      {/* Main Rate Display */}
			      <Text className="text-white text-center text-base font-medium mb-4">
			        1 {sellAsset.symbol} ≈ {(1 / rate).toFixed(6)} {buyAsset.symbol}
			      </Text>

			      {/* Simple Table */}
			      <View>


				  
				    {/* Row utility */}
				    {[
				      {
				        label: 'Best Price',
				        value: formatRouterName(lastQuote?.routerType),
						icon:
						  lastQuote?.routerType === 'aerodrome' ||
						  lastQuote?.routerType === 'aerodrome-slipstream'
						    ? require('@/assets/images/dex/aero.png')
						    : lastQuote?.routerType === 'uniswap-v2'
						    ? require('@/assets/images/dex/uniswap-v2.png')
						    : require('@/assets/images/dex/uniswap-v3.png'),
				      },
				      {
				        label: 'LP Provider Fee',
				        value: `${Number(lastQuote?.liquidityPoolFeePercent || 0).toFixed(2)}%`,
				      },
				      {
				        label: 'Swap Fee',
				        value: `${Number(lastQuote?.emigroFeePercent || 0).toFixed(2)}%`,
				      },
				      hasValidImpact && {
				        label: 'Price Impact',
				        value: `${priceImpact.toFixed(3)}%`,
				        isHighImpact: priceImpact > 5,
				      },
				      {
				        label: 'Minimum Received',
				        value: `${parseFloat(lastQuote?.humanMinAmountIn || '0').toFixed(6)} ${buyAsset.symbol}`,
				      }
				    ]
				    .filter(Boolean) // ✅ removes false/null
				    .map((row, idx) => {
				      const isBestPrice = row.label === 'Best Price';

				      // Build hop symbol list ONLY for Best Price row (icons only, no names)
				      let hopSymbols: string[] = [];
				      if (isBestPrice) {
				        if (Array.isArray(lastQuote?.displayPath) && lastQuote.displayPath.length > 0) {
				          hopSymbols = lastQuote.displayPath.map((p: any) => p?.symbol).filter(Boolean);
				        } else if (Array.isArray(lastQuote?.multihop) && lastQuote.multihop.length > 0) {
				          hopSymbols = [
				            lastQuote.multihop[0].fromTokenSymbol,
				            ...lastQuote.multihop.map((h: any) => h.toTokenSymbol),
				          ].filter(Boolean);
				        } else {
				          hopSymbols = [sellAsset?.symbol, buyAsset?.symbol].filter(Boolean);
				        }
				      }

				      return (
				        <View
				          key={idx}
				          style={{
				            flexDirection: 'row',
				            justifyContent: 'space-between',
				            alignItems: 'center',
				            borderBottomColor: '#333',
				            borderBottomWidth: 1,
				            paddingVertical: 10,
				          }}
				        >
				          <Text className="text-white text-sm">{row.label}</Text>

				          <HStack space="xs" align="center">
				            {row.icon && (
				              <Image
				                source={row.icon}
				                style={{ width: 16, height: 16, marginRight: 6 }}
				                resizeMode="contain"
				              />
				            )}

				            <Text
				              className={`text-sm ${
				                row.isHighImpact ? 'text-red-500 font-bold' : 'text-white'
				              }`}
				            >
				              {row.value}
				            </Text>

				            {isBestPrice && hopSymbols.length > 0 && (
				              <>
				                <Text
				                  className="text-white"
				                  style={{ marginHorizontal: 8, opacity: 0.4 }}
				                >
				                  •
				                </Text>
				                <HStack space="xs" align="center" style={{ alignItems: 'center' }}>
				                  {hopSymbols.map((sym, i) => (
				                    <React.Fragment key={`${sym}-${i}`}>
				                      {i > 0 && (
				                        <Text
				                          className="text-white"
				                          style={{ marginHorizontal: 6, opacity: 0.4 }}
				                        >
				                          &gt;
				                        </Text>
				                      )}
				                      <Image
				                        source={getAssetIcon({ symbol: sym })}
				                        style={{ width: 16, height: 16 }}
				                        resizeMode="contain"
				                      />
				                    </React.Fragment>
				                  ))}
				                </HStack>
				              </>
				            )}
				          </HStack>
				        </View>
				      );
				    })}

				      </View>
				    </View>
				  )}



			  
			  {errorMessage && (
			    <Text className="text-red-500 text-center mt-2">{errorMessage}</Text>
			  )}
			  



            </VStack>
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>


	  <SelectAssetActionSheet
	    walletId={selectedWalletId ?? ''}
	    isOpen={isAssetSheetOpen}
	    onClose={() => setIsAssetSheetOpen(false)}
		onSelect={(asset) => {
		  const clean = sanitizeAsset(asset);
		  console.log('[swap][index] ✅ Sanitized asset selected:', clean);

		  if (selectingSellAsset) {
		    // Changing the asset you pay with — reset input
		    setSellValue('');
		    setBuyValue('');
		    setRate(null);
		    setLastQuote(null);
		    setErrorMessage(null);
		    setSellAsset(clean);
		  } else {
		    // Changing the asset you receive — KEEP sellValue and just re-quote
		    setBuyValue('');
		    setRate(null);
		    setLastQuote(null);
		    setErrorMessage(null);

		    setBuyAsset(null); // force unmount of price info
		    setTimeout(() => {
		      setBuyAsset(clean);
		    }, 0);
		  }
		}}



	  />
    </>
  );
};

export default Swap;
