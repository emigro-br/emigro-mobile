// src/app/(auth)/payments/confirm/index.tsx

import React, { useEffect, useState } from 'react';
import { View, Pressable, Modal, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { observer } from 'mobx-react-lite';

import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { LoadingScreen } from '@/screens/Loading';

import { sessionStore } from '@/stores/SessionStore';
import { useWalletBalances } from '@/hooks/useWalletBalances';
import { paymentStore } from '@/stores/PaymentStore';
import { useChainStore } from '@/stores/ChainStore';

import { api } from '@/services/emigro/api';
import { fetchQuote } from '@/services/emigro/quotes';

import { Image } from 'react-native';
import { chainIconMap } from '@/utils/chainIconMap';
import { ChevronDown } from 'lucide-react-native';
import { assetIconMap } from '@/utils/assetIcons';

import uuid from 'react-native-uuid';

const ConfirmPayment = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { user } = sessionStore;
  const { scannedPayment } = paymentStore;
  const chains = useChainStore((state) => state.chains);


  const [selectedAssetId, setSelectedAssetId] = useState<string | null>('1e90df0a-2920-11f0-8f36-02ee245cdcb3');
  const [walletModalVisible, setWalletModalVisible] = useState(false);
  const [assetModalVisible, setAssetModalVisible] = useState(false);

  const wallets = user?.wallets ?? [];
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(wallets[0]?.id ?? null);
  const wallet = wallets.find((w) => w.id === selectedWalletId);
  const chain = chains.find((c) => c.id === wallet?.chainId);
  const { balances } = useWalletBalances(wallet?.id);
  const asset = balances.find((a) => a.assetId === selectedAssetId);
  if (!wallet) {
    console.warn('[ConfirmPayment] Wallet not found for selectedWalletId:', selectedWalletId);
    return <LoadingScreen message="Wallet not found. Please return and try again." />;
  }
  console.log('[ConfirmPayment] Selected asset object:', asset);
  
  const [usdQuote, setUsdQuote] = useState<string | null>(null);
  
  const [baseAmount, setBaseAmount] = useState<number | null>(null);
  const [slippage, setSlippage] = useState<number | null>(null);
  const [platformFee, setPlatformFee] = useState<number>(0);
  const [gasFee, setGasFee] = useState<number>(0.01); // fixed for now
  const [showFees, setShowFees] = useState(false);
  const [usdcAmountForBackend, setUsdcAmountForBackend] = useState<number | null>(null);

  const [payGasWithNative, setPayGasWithNative] = useState(false); // false = pay with USDC
  const [nativeToken, setNativeToken] = useState<string | null>(null);
  const [gasFeeEth, setGasFeeEth] = useState<number>(0.000005); // Hardcoded for now
  const [gasFeeInUsdc, setGasFeeInUsdc] = useState<number | null>(null);

  const generatedPaymentId = `${Date.now()}_${uuid.v4()}`;
  const [isConfirming, setIsConfirming] = useState(false);
    
  const [assetWalletModalVisible, setAssetWalletModalVisible] = useState(false);
  const [tempWalletId, setTempWalletId] = useState<string | null>(selectedWalletId);
  const tempWallet = wallets.find((w) => w.id === tempWalletId);
  const tempChain = chains.find((c) => c.id === tempWallet?.chainId);
  const filteredAssetsForTempWallet = balances.filter(
    (b) => b.chainId === tempChain?.id && b.isActive
  );
  
  if (chain && chain.is_active === false) {
    console.warn('[ConfirmPayment] Chain is not active:', chain.name);
    return (
      <LoadingScreen message="Selected network is currently disabled. Please choose another wallet." />
    );
  }

  console.log('[ConfirmPayment][DEBUG] Full chain object:', chain);
  console.log('[ConfirmPayment][DEBUG] Full asset object:', asset);
  
  useEffect(() => {
    if (!chain || !asset) return;
	console.log('[ConfirmPayment][CHECK] Asset decimals:', asset.decimals);
    console.log('[ConfirmPayment][CHECK] Asset isActive:', asset.isActive);
	console.log('[ConfirmPayment][CHECK] Chain isActive:', chain.isActive);
	console.log('[ConfirmPayment][CHECK] Chain supportsPaymaster:', chain.supportsPaymaster);
    console.log('[ConfirmPayment][CHECK] Chain gasFeeSponsored:', chain.gasFeeSponsored);

    const native = balances.find((b) => b.isNative && b.chainId === chain.id);
    setNativeToken(native?.symbol ?? 'ETH');
    console.log('[ConfirmPayment][CHECK] Native token detected:', native?.symbol);
    console.log('[ConfirmPayment][CHECK] Asset transfero_enabled:', asset.isTransferoEnabled);
  }, [chain, asset, balances]);
    
  const totalQuoteWithGas = (() => {
    if (!usdQuote) return null;

    const quote = parseFloat(usdQuote);

    const isNativeAsset = asset.symbol === chain.nativeSymbol;
    const gas = isNativeAsset ? gasFeeEth : gasFeeInUsdc ?? 0;

    return quote + gas;
  })();

	

  useEffect(() => {
    const fetchConvertedQuote = async () => {
      if (!scannedPayment?.transactionAmount || !asset?.symbol) return;

      try {
        const amount = scannedPayment.transactionAmount.toFixed(2);  // e.g., "0.01"
        const isUSDC = asset.symbol === 'USDC';

        // ←—— Step 1: BRL → USDC ———→
        const toUsdc = await fetchQuote({
          from: 'BRL',
          to: 'USDC',
          amount,
          type: 'strict_send',
        });
        console.log('[ConfirmPayment][fetchConvertedQuote] BRL→USDC fetchQuote response:', toUsdc);

        const rawUsdc = parseFloat(toUsdc.destination_amount ?? '0');
        console.log('[ConfirmPayment][fetchConvertedQuote] rawUsdc (BRL→USDC):', rawUsdc);

        // 🔥 This is the value we ALWAYS send to backend → in USDC
        const usdcWithFees = rawUsdc + platformFee;
        setUsdcAmountForBackend(usdcWithFees);
        console.log('[ConfirmPayment][fetchConvertedQuote] usdcWithFees (toTokenAmount):', usdcWithFees);

        if (isUSDC) {
          const slip = rawUsdc * 0.002;
          const finalUsdc = rawUsdc + slip + platformFee;
          console.log('[ConfirmPayment][fetchConvertedQuote] USDC slippage:', slip, 'USDC final with fees:', finalUsdc);

          setBaseAmount(rawUsdc);
          setSlippage(slip);
          setUsdQuote(finalUsdc.toFixed(6));
          return;
        }

        // ←—— Step 2: Convert USDC → token for display purposes only ———→
        const res = await api().get('/quote', {
          params: { asset: asset.symbol, fiat: 'USD' },
        });
        const pricePerUnit = parseFloat(res.data.price ?? '0');
        console.log(`[ConfirmPayment][fetchConvertedQuote] USD→${asset.symbol} pricePerUnit:`, pricePerUnit);

        const tokenAmount = rawUsdc / pricePerUnit;
        const slip = tokenAmount * 0.01;
        const finalToken = tokenAmount + slip + platformFee;
        console.log('[ConfirmPayment][fetchConvertedQuote] tokenAmount (raw):', tokenAmount);
        console.log('[ConfirmPayment][fetchConvertedQuote] token slippage:', slip, 'token final with fees:', finalToken);

        setBaseAmount(tokenAmount);
        setSlippage(slip);
        setUsdQuote(finalToken.toFixed(10));
      } catch (error) {
        console.error('[ConfirmPayment][fetchConvertedQuote] ❌ Quote fetch failed:', error);
        setUsdQuote(null);
        setBaseAmount(null);
        setSlippage(null);
        setUsdcAmountForBackend(null);
      }
    };

    fetchConvertedQuote();
  }, [scannedPayment.transactionAmount, asset?.symbol]);





  
  useEffect(() => {
    console.log('[ConfirmPayment] fetching chains...');
    useChainStore.getState().fetchChains();
  }, []);

  // Logs
  console.log('[ConfirmPayment] wallets:', wallets);
  console.log('[ConfirmPayment] selectedWalletId:', selectedWalletId);
  console.log('[ConfirmPayment] selectedAssetId:', selectedAssetId);
  console.log('[ConfirmPayment] wallet:', wallet);
  console.log('[ConfirmPayment] chain:', chain);
  console.log('[ConfirmPayment] balances:', balances);
  console.log('[ConfirmPayment] asset:', asset);
  console.log('[ConfirmPayment] scannedPayment:', scannedPayment);

  useEffect(() => {
    const fetchNativeAsset = async () => {
      if (!chain || !chain.id || !chain.nativeSymbol) return;

      try {
        const res = await api().get('/assets/native-asset', {
          params: {
            chainId: chain.id,
            symbol: chain.nativeSymbol,
          },
        });

        console.log('[ConfirmPayment] ✅ Native asset fetched from backend:', res.data);

        // You can do something with it, e.g., update nativeToken symbol or store the whole object
        setNativeToken(res.data.symbol); // Example: using symbol
        // OR: setNativeAsset(res.data) if you need full object (you’d need to define nativeAsset state)
      } catch (err) {
        console.error('[ConfirmPayment] ❌ Failed to fetch native asset:', err.response?.data || err.message);
      }
    };

    fetchNativeAsset();
  }, [chain]);

  
  const isLoadingEssentialData =
    !scannedPayment ||
    !wallet ||
    !chain ||
    balances.length === 0 ||
    !asset;

  if (isLoadingEssentialData) {
    console.log('[ConfirmPayment] Waiting for data:', {
      scannedPaymentLoaded: !!scannedPayment,
      walletFound: !!wallet,
      chainFound: !!chain,
      balancesLength: balances.length,
      assetFound: !!asset,
    });
    return <LoadingScreen />;
  }

  const formatAmountWithPrecision = (
    value: string | number,
    isUSDC: boolean
  ): JSX.Element => {
    const strValue = typeof value === 'number' ? value.toFixed(10) : value;
    const [intPart, decimalPart = ''] = strValue.split('.');

    if (isUSDC) {
      const visible = decimalPart.slice(0, 2);
      const faint = decimalPart.slice(2, 6);
      return (
        <>
          <Text className="text-black text-4xl font-bold">{intPart}.</Text>
          <Text className="text-black text-2xl font-bold">{visible}</Text>
          {faint && <Text className="text-gray-400 text-2xl">{faint}</Text>}
        </>
      );
    } else {
      const visible = decimalPart.slice(0, 6);
      const faint = decimalPart.slice(6, 10);
      return (
        <>
          <Text className="text-black text-4xl font-bold">{intPart}.</Text>
          <Text className="text-black text-2xl font-bold">{visible}</Text>
          {faint && <Text className="text-gray-400 text-2xl">{faint}</Text>}
        </>
      );
    }
  };

  
  useEffect(() => {
    if (!chain || !balances.length) return;

    const native = balances.find(b => !b.symbol || b.symbol === chain.nativeSymbol || b.assetId === null || b.assetId === '');
    setNativeToken(native?.symbol ?? 'ETH'); // fallback for now

    // Gas fee quote
	const quoteGasFee = async () => {
	  if (!asset?.symbol || !chain?.nativeSymbol) {
	    console.warn('[GasFee] Missing asset or chain.nativeSymbol');
	    return;
	  }

	  console.log('[GasFee] Starting gas quote...');
	  console.log(`[GasFee] Selected asset: ${asset.symbol}`);
	  console.log(`[GasFee] Native chain token: ${chain.nativeSymbol}`);
	  console.log(`[GasFee] Fixed gasFeeEth: ${gasFeeEth}`);

	  try {
	    // Case 1: Selected asset IS native (e.g. ETH → ETH)
	    if (asset.symbol === chain.nativeSymbol) {
	      console.log('[GasFee] Selected asset is native, no conversion needed.');
	      setGasFeeInUsdc(gasFeeEth);
	      return;
	    }

	    // Step 1: ETH → USD
	    console.log('[GasFee] Fetching ETH → USD...');
	    const ethToUsdRes = await api().get('/quote', {
	      params: {
	        asset: 'ETH',
	        fiat: 'USD',
	      },
	    });

	    const ethPriceUsd = parseFloat(ethToUsdRes?.data?.price ?? '0');
	    if (!ethPriceUsd) throw new Error('Missing ETH→USD quote');

	    const gasInUsd = gasFeeEth * ethPriceUsd;
	    console.log(`[GasFee] ETH price in USD: ${ethPriceUsd}`);
	    console.log(`[GasFee] Calculated gas in USD: ${gasInUsd}`);

	    // Case 2: Asset is USDC → no second conversion
	    if (asset.symbol === 'USDC') {
	      console.log('[GasFee] Asset is USDC, no need to convert USD → USDC.');
	      setGasFeeInUsdc(gasInUsd);
	      return;
	    }

	    // Step 2: USD → selected asset
	    console.log(`[GasFee] Fetching USD → ${asset.symbol}...`);
	    const usdToTokenRes = await api().get('/quote', {
	      params: {
	        from: 'USD',
	        to: asset.symbol,
	        amount: gasInUsd.toFixed(6),
	        type: 'strict_send',
	      },
	    });

	    const converted = parseFloat(usdToTokenRes?.data?.destination_amount ?? '0');
	    if (!converted) throw new Error('Missing USD→Token quote');

	    console.log(`[GasFee] Converted gas fee: ${converted} ${asset.symbol}`);
	    setGasFeeInUsdc(converted);
	  } catch (err) {
	    console.warn('[GasFee] ❌ Failed to quote gas fee in selected token:', err);
	    setGasFeeInUsdc(null);
	  }
	};



    quoteGasFee();
  }, [chain, balances]);

  function toMicroUnits(amount: number, decimals: number): string {
    return String(Math.floor(amount * 10 ** decimals));
  }
  
  const handleConfirm = async () => {
    if (isConfirming) return; // prevent double click
    setIsConfirming(true);

    console.log('[handleConfirm] Starting confirmation...');

    if (!scannedPayment || !chain || !asset || !usdQuote) {
      console.error('[handleConfirm] Missing required fields', {
        scannedPayment,
        chain,
        asset,
        usdQuote,
      });
      setIsConfirming(false); // reset if failed
      return;
    }

    let tokenAddress = asset.tokenAddress;

	// ✅ Handle native token fallback
	if (!tokenAddress || !tokenAddress.startsWith('0x')) {
	  const isNative = asset.symbol === chain.nativeSymbol;
	  if (isNative) {
	    console.log('[handleConfirm] Detected native token, using 0x000000...');
	    tokenAddress = '0x0000000000000000000000000000000000000000';
	  } else {
	    console.log('[handleConfirm] Fetching token address via /assets/:assetId/full...');
	    try {
	      const res = await api().get(`/assets/${asset.assetId}/full`);
	      console.log('[handleConfirm] API full response:', res.data);

	      tokenAddress = res.data.contractAddress;

	      if (!tokenAddress || !tokenAddress.startsWith('0x')) {
	        console.error('[handleConfirm] API response missing valid contractAddress:', tokenAddress);
	        setIsConfirming(false);
	        return;
	      }

	      console.log('[handleConfirm] Retrieved tokenAddress:', tokenAddress);
	    } catch (e) {
	      console.error('[handleConfirm] Failed to fetch token address from API:', e);
	      setIsConfirming(false);
	      return;
	    }
	  }
	}

	const decimals = asset.decimals;                            // e.g. 6 for USDC or 18 for ETH
	const humanQuote = parseFloat(usdQuote!);                   // your string like "0.123456"
	const multiplier = 10 ** decimals;                          // 1e6 or 1e18
	const integerAmount = Math.floor(humanQuote * multiplier); // the on-chain integer

	console.log('[handleConfirm] humanQuote (float):', humanQuote);
	console.log('[handleConfirm] using decimals:', decimals);
	console.log('[handleConfirm] integerAmount (on-chain):', integerAmount);

	// get the value of the quote in USDC:
	if (usdcAmountForBackend == null) {
	  console.error('[handleConfirm] Missing usdcAmountForBackend');
	  setIsConfirming(false);
	  return;
	}

	const toTokenAmount = toMicroUnits(usdcAmountForBackend, 6);
	console.log('[handleConfirm][CONVERT] usdcAmountForBackend:', usdcAmountForBackend);
	console.log('[handleConfirm][CONVERT] toTokenAmount (micro):', toTokenAmount);
	
    const payload = {
      paymentId: generatedPaymentId,
      token: tokenAddress,
      amount: String(integerAmount),
      usePaymaster: chain.supportsPaymaster ? !payGasWithNative : false,
      chainId: chain.chainId,
      walletId: user.circleWallet?.circleWalletId,
      assetId: asset.assetId,
      tokenSymbol: asset.symbol,
      rawBrcode: scannedPayment.brCode,
      transferoTxid: scannedPayment.txid,
      taxId: scannedPayment.taxId,
      name: scannedPayment.merchantName,
      pixKey: scannedPayment.pixKey,
	  fiatAmount: scannedPayment.transactionAmount.toFixed(6),
	  toTokenAmount,
    };

    console.log('[handleConfirm] Payload to be sent to backend:');
    Object.entries(payload).forEach(([key, value]) => {
      console.log(`→ ${key}:`, value);
    });

    // 🔥 Immediately go to status screen
    router.replace({
      pathname: '/payments/confirm/status',
      params: { id: generatedPaymentId },
    });

    try {
      const response = await api().post('/evm/create-escrow-evm', payload);
      console.log('[handleConfirm] Escrow created successfully:', response.data);
    } catch (error) {
      console.error('[handleConfirm] Error creating escrow:', error.response?.data || error.message);
    }
  };






  const handleCancel = () => {
    router.replace('/');
  };

  const filteredAssets = balances.filter(b => b.chainId === chain.id && b.isActive);
  console.log('[ConfirmPayment] filteredAssets:', filteredAssets.length, filteredAssets);

  return (
    <>
	<Stack.Screen options={{ title: 'Review the payment', headerBackTitleVisible: false }} />
	<Box className="flex-1 bg-background-900" style={{ paddingTop: insets.top }}>
	  <VStack space="lg" className="p-4">

	    {/* Header Amount */}
	    <Text className="text-white text-xl font-semibold">Review the payment</Text>
	    <Text className="text-white text-6xl font-extrabold leading-none">
	      R$ {scannedPayment.transactionAmount.toFixed(2)}
	    </Text>

	    {/* Bank Info */}
	    <VStack className="mb-5 mt-[-10]">
	      <HStack className="justify-between">
	        <Text className="text-white font-bold">Name:</Text>
	        <Text className="text-white text-right">{scannedPayment.merchantName}</Text>
	      </HStack>
	      <HStack className="justify-between">
	        <Text className="text-white font-bold">Amount:</Text>
	        <Text className="text-white text-right">R$ {scannedPayment.transactionAmount.toFixed(2)}</Text>
	      </HStack>
	      <HStack className="justify-between">
	        <Text className="text-white font-bold">Identifier:</Text>
	        <Text className="text-white text-right">{scannedPayment.txid}</Text>
	      </HStack>
	    </VStack>

	    {/* Amount + Asset Pill */}
		<Pressable
		  className="flex-row items-center justify-between py-1 rounded-xl"
		>
		  {/* Chain Icon */}
		  {chain?.iconUrl && chainIconMap[chain.iconUrl] ? (
		    <Image
		      source={chainIconMap[chain.iconUrl]}
		      style={{ width: 24, height: 24, borderRadius: 12, marginRight: 8 }}
		      resizeMode="contain"
		    />
		  ) : (
		    <View className="w-6 h-6 bg-white rounded-full mr-2" />
		  )}
		  {/* Wallet Address */}
		  <Text className="text-white flex-1">
		    {wallet.publicAddress.slice(0, 6)}...{wallet.publicAddress.slice(-4)} [{chain.name}]
		  </Text>

		  {/* Chain Name */}
		  <Text className="text-white font-semibold"></Text>
		</Pressable>

		{/* Payment Row */}
		<HStack className="bg-white rounded-xl overflow-hidden mt-[-10px] mb-[-10px]">
		  <Box className="flex-1 p-4">
		    <Text className="text-gray-500">You will pay max</Text>
			<Box className="flex-row flex-wrap items-baseline">
			  {totalQuoteWithGas
			    ? formatAmountWithPrecision(totalQuoteWithGas, asset.symbol === 'USDC')
			    : <Text className="text-4xl font-bold text-black">...</Text>}
			</Box>


		  </Box>
		  <Pressable
		    onPress={() => setAssetWalletModalVisible(true)}
		    className="bg-[#FF0050] px-4 py-2 justify-center items-start rounded-tr-xl rounded-br-xl"
		  >
		    <View className="flex-row items-center space-x-3">
		      <View>
		        <Text className="text-white text-lg font-bold">{asset.symbol}</Text>
		        <Text className="text-white text-sm">{chain.name}</Text>
		      </View>
		      <ChevronDown color="white" size={16} />
		    </View>
		  </Pressable>


		</HStack>

		{/* Balance + Fees Header Row */}
		<HStack className="justify-between items-center px-1 mt-1 mb-0">
		  <Text className="text-white text-sm font-bold">
		    Balance: {asset?.balance ?? '...'} {asset?.symbol}
		  </Text>
		  <Pressable onPress={() => setShowFees((prev) => !prev)}>
		  <View className="border-b-2 border-gray-500 border-dashed pb-0.5 self-start">
		    <Text className="text-white text-sm font-semibold">Details</Text>
		  </View>
		  </Pressable>
		</HStack>

		{/* Fees Breakdown */}
		{showFees && (
		  <HStack className="mt-[-10px] justify-end items-start px-1">
		    {/* Fee Details Text */}
		    <VStack space="xs" className="mr-3 pt-[10px]">
		      <Text className="text-white text-sm">
		        Quote (raw): <Text className="font-bold">{baseAmount?.toFixed(6) ?? '...'}</Text> {asset?.symbol}
		      </Text>
		      <Text className="text-white text-sm">
		        Max Slippage ({asset?.symbol === 'USDC' ? '0.2%' : '1%'}): <Text className="font-bold">{slippage?.toFixed(6) ?? '...'}</Text> {asset?.symbol}
		      </Text>
		      <Text className="text-white text-sm">
		        Transaction Fee (0%): <Text className="font-bold">{platformFee.toFixed(2)}</Text> {asset?.symbol}
		      </Text>
			  <Text className="text-white text-sm">
			    Gas Fee (est.): <Text className="font-bold">
				{asset.symbol === chain.nativeSymbol
				  ? `${gasFeeEth.toFixed(8)} ${nativeToken}`
				  : `${gasFeeInUsdc?.toFixed(6) ?? '...'} ${asset.symbol}`}
			    </Text>
			  </Text>
		    </VStack>

		    {/* Vertical Line with Dots */}
		    <View className="relative items-center justify-between pt-[10px] pb-[1px]">
		      <View className="absolute w-[2px] bg-white h-full left-[3.5px]" />
		      {[0, 1, 2, 3].map((_, i) => (
		        <View
		          key={i}
		          className="w-[9px] h-[9px] rounded-full bg-white"
		          style={{ marginVertical: 6 }}
		        />
		      ))}
		    </View>
		  </HStack>
		)}






	    {/* Details */}
		{chain.supportsPaymaster && (
			<HStack className="justify-between items-center mt-5">
			  <Text className="text-white">Gas fee currency</Text>
			  <HStack space="sm" className="bg-white rounded-md overflow-hidden">
			    <Pressable onPress={() => setPayGasWithNative(false)}>
			      <Box className={`px-3 py-1 ${!payGasWithNative ? 'bg-[#FF0050]' : ''}`}>
			        <Text className={`font-semibold ${!payGasWithNative ? 'text-white' : 'text-black'}`}>USDC</Text>
			      </Box>
			    </Pressable>
			    <Pressable onPress={() => setPayGasWithNative(true)}>
			      <Box className={`px-3 py-1 ${payGasWithNative ? 'bg-[#FF0050]' : ''}`}>
			        <Text className={`font-semibold ${payGasWithNative ? 'text-white' : 'text-black'}`}>
			          {nativeToken ?? 'ETH'}
			        </Text>
			      </Box>
			    </Pressable>
			  </HStack>
			</HStack>
		)}

	    {/* Pay Button */}
		<Button
		  onPress={handleConfirm}
		  className="mt-6 rounded-full bg-[#FF0050] h-14"
		  disabled={isLoadingEssentialData || usdQuote === null || isConfirming}
		>
		  <ButtonText className="text-white text-2xl">
		    {isConfirming ? 'Processing...' : 'Pay'}
		  </ButtonText>
		</Button>


	    {/* Quote Timer */}

	    <Text className="text-white text-sm text-center text-lg">
	      New quote in <Text className="font-bold">20</Text> seconds
	    </Text>

	    {/* Cancel */}
		<Button
		  variant="outline"
		  onPress={handleCancel}
		  className="mt-6 border border-[#444]"
		>
		  <ButtonText className="text-white text-lg">Cancel</ButtonText>
		</Button>
		
		<Text className="text-white text-sm text-center mt-1">
		  The seller will receive the exact value he set. The quantity that will be sent is computed automatically.
		</Text>
	  </VStack>
	</Box>

      {/* Wallet+Chain+Asset Selection Modal */}
	  <Modal visible={assetWalletModalVisible} transparent animationType="slide">
	    <View className="flex-1 justify-center items-center bg-black/80">
	      <Card className="w-11/12 p-4 bg-[#222] rounded-xl max-h-[90%]">
	        <Heading className="text-white mb-4">Select Asset</Heading>

	        {/* Wallet / Chain Selector with Chain Icons */}
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

	        {/* Asset List with Asset Icons */}
			<FlatList
			  data={filteredAssetsForTempWallet}
			  keyExtractor={(item) => item.assetId}
			  renderItem={({ item }) => {
			    const assetIcon = assetIconMap[item.symbol.toLowerCase()];
			    return (
			      <Pressable
			        onPress={() => {
			          setSelectedWalletId(tempWalletId);
			          setSelectedAssetId(item.assetId);
			          setAssetWalletModalVisible(false);
			        }}
			        className="flex-row items-center py-3 px-4 mb-2 bg-[#3a3a3a] rounded-lg"
			      >
			        {assetIcon && (
			          <Image
			            source={assetIcon}
			            className="w-10 h-10 mr-4 rounded-full"
			            resizeMode="contain"
			          />
			        )}
			        <View className="flex-1">
			          <Text className="text-white text-base font-semibold">
			            {item.name} ({item.symbol})
			          </Text>
			          <Text className="text-gray-300 text-sm">
			            Balance: {parseFloat(item.balance).toFixed(6)} {item.symbol}
			          </Text>
			        </View>
			      </Pressable>
			    );
			  }}
			/>



			<Button
			  onPress={() => setAssetWalletModalVisible(false)}
			  className="mt-4 border border-white bg-transparent px-4 py-2 rounded-md"
			>
			  <ButtonText className="text-white">Cancel</ButtonText>
			</Button>
	      </Card>
	    </View>
	  </Modal>

    </>
  );
};

export default observer(ConfirmPayment);
