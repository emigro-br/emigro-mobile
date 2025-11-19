// src/app/(auth)/payments/confirm/index.tsx

import React, { useEffect, useState } from 'react';
import { View, Pressable, Modal, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { observer } from 'mobx-react-lite';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';

import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { LoadingScreen } from '@/screens/Loading';

import { sessionStore } from '@/stores/SessionStore';
import { useWalletBalances } from '@/hooks/useWalletBalances';
import { paymentStore } from '@/stores/PaymentStore';
import { useChainStore } from '@/stores/ChainStore';
import { SelectAssetSheet } from '@/components/payments/SelectAssetSheet';

import { api } from '@/services/emigro/api';
import { fetchFiatQuote, fetchDirectFiatPairQuote } from '@/services/emigro/quotes';

import { Image } from 'react-native';
import { chainIconMap } from '@/utils/chainIconMap';
import { ChevronDown } from 'lucide-react-native';
import { assetIconMap } from '@/utils/assetIcons';

import uuid from 'react-native-uuid';

import { fetchPrimaryCurrency } from '@/services/emigro/userPrimaryCurrency';

const ConfirmPayment = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { user } = sessionStore;
  const { scannedPayment } = paymentStore;
  const chains = useChainStore((state) => state.chains);

  // --- Emigro fee preview state (BRL) ---
  const [fixedFeeBrl, setFixedFeeBrl] = useState<number>(0);
  const [pctFeeBrl, setPctFeeBrl] = useState<number>(0);
  const [premiumBrl, setPremiumBrl] = useState<number>(0);
  const [finalBrl, setFinalBrl] = useState<number | null>(null);

  // % text for UI (derived from pct fee / base)
  const [pctPercent, setPctPercent] = useState<number>(0);

  // cache USDC→BRL price for quoting
  const [usdcBrlPrice, setUsdcBrlPrice] = useState<number | null>(null);
  
  // raw fraction from server (e.g. 0.01 for 1%) to avoid rounding issues
  const [feePctRaw, setFeePctRaw] = useState<number>(0);

  const fmtBRL = (n: number) => `R$ ${Number(n).toFixed(2)}`.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');


  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);



  const wallets = user?.wallets ?? [];
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);

  // resolve current wallet & balances from selection (after we set them below)
  const wallet = wallets.find((w) => w.id === selectedWalletId) ?? wallets[0];
  const chain = chains.find((c) => c.id === wallet?.chainId);
  const { balances } = useWalletBalances(wallet?.id ?? '');

  const asset = balances.find((a) => a.assetId === selectedAssetId) ?? null;

  /**
   * Bootstrap selection: try user's Primary Currency, then fall back to first wallet + first active asset
   */
  useEffect(() => {
    (async () => {
      // already initialized?
      if (selectedWalletId && selectedAssetId) return;

      try {
        const primary = await fetchPrimaryCurrency(); // { chainId, assetId, chainIdOnchain }
        if (primary?.chainId && primary?.assetId) {
          // pick a wallet on that chain
          const w = wallets.find((x) => x.chainId === primary.chainId) ?? wallets[0];
          if (w) {
            setSelectedWalletId(w.id);

            // ensure balances for that wallet are fetched before selecting the asset
            // (useWalletBalances above auto-fetches when walletId changes)
            // pick asset by id once balances are present; we may attempt immediately
            setSelectedAssetId(primary.assetId);
            return;
          }
        }
      } catch (e) {
        console.warn('[ConfirmPayment] primary currency fetch failed, will fallback:', e);
      }

      // fallback path: first wallet, first active asset on its chain
      const fw = wallets[0];
      if (fw) {
        setSelectedWalletId(fw.id);
      }
    })();
  // include wallets so this runs when user info loads
  }, [wallets]);

  if (!wallet) {
    console.warn('[ConfirmPayment] Wallet not found for selectedWalletId:', selectedWalletId);
  }
  console.log('[ConfirmPayment] Selected asset object:', asset);

  // When we have a wallet selected but no asset selected yet (e.g., right after bootstrap),
  // pick the first active asset on that wallet's chain as a fallback.
  useEffect(() => {
    if (!selectedAssetId && chain && balances.length) {
      const firstActive = balances.find((b) => b.chainId === chain.id && b.isActive);
      if (firstActive?.assetId) {
        setSelectedAssetId(firstActive.assetId);
      }
    }
  }, [selectedAssetId, chain?.id, balances]);

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



  // Load fee preview (BRL) and USDC→BRL FX whenever base BRL changes
  useEffect(() => {
    const run = async () => {
      try {
        const baseBrl = Number(scannedPayment?.transactionAmount ?? 0);
        console.log('[fees][preview] baseBrl from Pix (merchant amount, no fee):', baseBrl);

        if (!Number.isFinite(baseBrl) || baseBrl <= 0) {
          setFixedFeeBrl(0);
          setPctFeeBrl(0);
          setPremiumBrl(0);
          setFinalBrl(null);
          setPctPercent(0);
          console.warn('[fees][preview] invalid/zero baseBrl; resetting fee state.');
          return;
        }

        // 1) Fees preview (from your existing /fees/preview)
        const feeRes = await api().post('/fees/preview', { amountBrl: baseBrl });
        console.log('[fees][preview] /fees/preview response:', feeRes?.data);

		const {
		  fixedBrl = 0,
		  pctBrl = 0,
		  premium = 0,
		  total = baseBrl,
		  usdPerBrl = 0,

		  // NEW from backend
		  feePct,        // raw fraction (e.g., 0.01 for 1%)
		  feeFixedUsd,   // for logging only
		} = feeRes?.data ?? {};

		const fixedBrlNum = Number(fixedBrl) || 0;
		const pctBrlNum   = Number(pctBrl)   || 0;
		const premiumNum  = Number(premium)  || 0;
		const totalNum    = Number(total)    || baseBrl;

		setFixedFeeBrl(fixedBrlNum);
		setPctFeeBrl(pctBrlNum);
		setPremiumBrl(premiumNum);
		setFinalBrl(totalNum);

		// Prefer raw fraction from server; fallback to derived-from-rounded
		let pctDisplay = 0;
		if (typeof feePct === 'number' && isFinite(feePct)) {
		  pctDisplay = feePct * 100;
		  setFeePctRaw(feePct);
		} else {
		  const derived = baseBrl > 0 ? (pctBrlNum / baseBrl) * 100 : 0;
		  pctDisplay = Number.isFinite(derived) ? derived : 0;
		  setFeePctRaw(derived / 100); // keep some value for consistency
		}
		setPctPercent(pctDisplay);

		console.log('[fees][preview] derived:', {
		  fixedFeeBrl: fixedBrlNum,
		  pctFeeBrl: pctBrlNum,
		  premiumBrl: premiumNum,
		  finalBrl: totalNum,
		  pctPercent: pctDisplay,
		  usdPerBrl,
		  feePctRaw: feePct,
		  feeFixedUsd,
		});


        // 2) USDC→BRL (BRL per 1 USDC) to use for quoting
        // If usdPerBrl came, invert it safely; otherwise call your existing quotes helper
        if (usdPerBrl && usdPerBrl > 0) {
          const brlPerUsdc = 1 / usdPerBrl;
          console.log('[fees][preview] usdPerBrl available; BRL per 1 USDC =', brlPerUsdc);
          setUsdcBrlPrice(brlPerUsdc);
        } else {
          const px = await fetchDirectFiatPairQuote('USDC', 'BRL');
          console.log('[fees][preview] fetched BRL per 1 USDC via quotes helper =', px);
          setUsdcBrlPrice(px && px > 0 ? px : null);
        }
      } catch (e) {
        // graceful fallback
        console.warn('[fees][preview] error, resetting fee state:', e);
        setFixedFeeBrl(0);
        setPctFeeBrl(0);
        setPremiumBrl(0);
        setFinalBrl(null);
        setPctPercent(0);
        setUsdcBrlPrice(null);
      }
    };
    run();
  }, [scannedPayment?.transactionAmount]);


  const fetchConvertedQuote = async () => {
    if (!asset?.symbol) return;

    try {
      // Base BRL (merchant amount) -> backend / Transfero / net escrow
      const baseBrl = Number(scannedPayment?.transactionAmount ?? 0);
      console.log('[quote] baseBrl (to backend / merchant):', baseBrl);

      if (!Number.isFinite(baseBrl) || baseBrl <= 0) {
        setUsdQuote(null);
        setBaseAmount(null);
        setSlippage(null);
        setUsdcAmountForBackend(null);
        console.warn('[quote] invalid/zero baseBrl; skipping quote.');
        return;
      }

      // Final BRL for **display only** (includes Emigro fee if any)
      const displayBrl = Number(finalBrl ?? baseBrl);
      console.log('[quote] displayBrl (user pays incl. Emigro fee):', displayBrl);

      // BRL per 1 USDC
      const px = usdcBrlPrice ?? (await fetchDirectFiatPairQuote('USDC', 'BRL'));
      if (!px || px <= 0) throw new Error(`Invalid USDC→BRL price: ${px}`);
      console.log('[quote] BRL per 1 USDC:', px);

      // --- NET USDC for backend (merchant payout) ---
      const usdcNeededNet = baseBrl / px;
      setUsdcAmountForBackend(usdcNeededNet); // <-- keep backend/net on base
      console.log('[quote] usdcNeededNet (backend settlement, no UI slippage):', usdcNeededNet);

      // --- DISPLAY amount (user "will pay") uses final BRL (base + fee) ---
      const usdcForDisplay = displayBrl / px;
      console.log('[quote] usdcForDisplay (fee-inclusive before token conversion):', usdcForDisplay);

      if (asset.symbol === 'USDC') {
        // Visual slippage (0.2%) only for UI
        const slip = usdcForDisplay * 0.002;
        setBaseAmount(usdcForDisplay);
        setSlippage(slip);
        const quoted = (usdcForDisplay + slip).toFixed(6);
        setUsdQuote(quoted);
        console.log('[quote] USDC path -> slip(0.2%):', slip, 'usdQuote (no gas):', quoted);
        return;
      }

      // Non-USDC asset: convert via USD price for display amount
      const tokenUsdPrice = await fetchFiatQuote(asset.symbol, 'USD'); // USD per 1 token
      if (!tokenUsdPrice || isNaN(tokenUsdPrice) || tokenUsdPrice <= 0) {
        throw new Error(`Invalid ${asset.symbol}/USD price: ${tokenUsdPrice}`);
      }
      console.log(`[quote] ${asset.symbol} price USD per 1 token:`, tokenUsdPrice);

      const tokenAmountDisplay = usdcForDisplay / tokenUsdPrice; // USDC≈USD
      const slip = tokenAmountDisplay * 0.01; // 1% UI slippage for tokens
      setBaseAmount(tokenAmountDisplay);
      setSlippage(slip);
      const quoted = (tokenAmountDisplay + slip).toFixed(10);
      setUsdQuote(quoted);
      console.log('[quote] token path -> base:', tokenAmountDisplay, 'slip(1%):', slip, 'usdQuote (no gas):', quoted);
    } catch (error) {
      console.error('[ConfirmPayment][fetchConvertedQuote] ❌ Quote fetch failed:', error);
      setUsdQuote(null);
      setBaseAmount(null);
      setSlippage(null);
      setUsdcAmountForBackend(null);
    }
  };





  
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
    if (!usdQuote || !asset || !chain) return null;

    const quote = parseFloat(usdQuote);

    const isNativeAsset = asset.symbol === chain.nativeSymbol;
    const gas = isNativeAsset ? gasFeeEth : (gasFeeInUsdc ?? 0);

    return quote + gas;
  })();

  // 🔒 Disable payment if the quoted total (incl. gas) exceeds wallet balance
  const insufficientBalance = (() => {
    if (!asset || !totalQuoteWithGas) return false;
    const bal = parseFloat(String(asset.balance ?? '0'));
    const needed = Number(totalQuoteWithGas);
    if (!Number.isFinite(bal) || !Number.isFinite(needed)) return false;
    return bal < needed;
  })();

  useEffect(() => {
    if (!usdQuote || !asset || !chain) return;

    const q = parseFloat(usdQuote);
    const isNativeAsset = asset.symbol === chain.nativeSymbol;
    const gas = isNativeAsset ? gasFeeEth : (gasFeeInUsdc ?? 0);
    const total = q + gas;

    console.log(
      '[quote][display] usdQuote(no gas):', q,
      '| gas used:', isNativeAsset ? `${gas} ${nativeToken}` : `${gas} ${asset.symbol}`,
      '| totalQuoteWithGas:', total
    );
  }, [usdQuote, gasFeeEth, gasFeeInUsdc, asset, chain, nativeToken]);



  useEffect(() => {
    fetchConvertedQuote();
  }, [scannedPayment.transactionAmount, finalBrl, asset?.symbol]);



  // Recreate the timer whenever inputs that affect displayBrl change,
  // so the interval callback always uses the latest finalBrl (fee-inclusive).
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('[ConfirmPayment] 🔄 Refreshing quote (timer)...');
      fetchConvertedQuote();
    }, 30000); // 30 seconds

    return () => clearInterval(interval); // Clean up on unmount
  }, [asset?.symbol, scannedPayment.transactionAmount, finalBrl]);




  
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
  console.log('[ConfirmPayment] keys:', { brCode: scannedPayment?.brCode, pixKey: scannedPayment?.pixKey });


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
  }

  // unify inactive-chain flag (don’t early-return)
  const chainInactive = !!(chain && (chain as any).is_active === false);


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

	  // ✅ Short-circuit for sponsored gas
	  if (chain.gasFeeSponsored === 1) {
	    console.log('[GasFee] Chain has sponsored gas. Setting gas fee to 0.');
	    setGasFeeEth(0);
	    setGasFeeInUsdc(0);
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
	// --- SUMMARY LOG BEFORE SENDING ---
	(function () {
	  const baseBrl = Number(scannedPayment.transactionAmount);
	  const displayBrl = Number(finalBrl ?? baseBrl);
	  const isNativeAsset = asset.symbol === chain.nativeSymbol;
	  const gasUsed = isNativeAsset ? `${gasFeeEth} ${nativeToken}` : `${gasFeeInUsdc ?? 0} ${asset.symbol}`;
	  console.log('[handleConfirm][SUMMARY] baseBrl (merchant/base, sent to backend as fiatAmount):', baseBrl);
	  console.log('[handleConfirm][SUMMARY] displayBrl (user pays, fee-inclusive):', displayBrl);
	  console.log('[handleConfirm][SUMMARY] usdQuote (token max without gas):', usdQuote);
	  console.log('[handleConfirm][SUMMARY] gas used:', gasUsed);
	  console.log('[handleConfirm][SUMMARY] totalQuoteWithGas (token max incl. gas):', totalQuoteWithGas);
	  console.log('[handleConfirm][SUMMARY] integerAmount (on-chain amount in selected token units):', integerAmount);
	  console.log('[handleConfirm][SUMMARY] toTokenAmount (USDC micro sent to backend for net settlement):', toTokenAmount);
	  console.log('[handleConfirm][SUMMARY] NOTE: backend computes on-chain fee; client sends BASE fiatAmount only.');
	})();

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

  
  
  
  const [quoteCountdown, setQuoteCountdown] = useState(30);

  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteCountdown(prev => (prev === 1 ? 30 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  return (
    <>
      <Stack.Screen options={{ title: 'Review the payment', headerBackTitleVisible: false }} />

      {chainInactive ? (
        <LoadingScreen message="Selected network is currently disabled. Please choose another wallet." />
      ) : isLoadingEssentialData ? (
        <LoadingScreen />
		) : (
		  <>
		    <Box className="flex-1 bg-background-900" style={{ paddingTop: insets.top }}>
		      <VStack space="lg" className="p-4">




	    {/* Header Amount */}
	    <Text className="text-white text-xl font-semibold">Review the payment</Text>
	    <Text className="text-white text-6xl font-extrabold leading-none">
	      R$ {scannedPayment.transactionAmount.toFixed(2)}
	    </Text>

	    {/* Bank Info */}
		{/* Bank / PIX Info */}
		<VStack className="mb-5 mt-[-10]">
		{scannedPayment.merchantName &&
		 scannedPayment.merchantName !== 'Unknown Merchant' ? (
		  <HStack className="justify-between">
		    <Text className="text-white font-bold">Name:</Text>
		    <Text className="text-white text-right">
		      {scannedPayment.merchantName}
		    </Text>
		  </HStack>
		) : null}

		  <HStack className="justify-between">
		    <Text className="text-white font-bold">Pix Amount:</Text>
		    <Text className="text-white text-right">R$ {scannedPayment.transactionAmount.toFixed(2)}</Text>
		  </HStack>
		  {scannedPayment.pixKey ? (
		    <HStack className="justify-between">
		      <Text className="text-white font-bold">PIX key:</Text>
		      <Text className="text-white text-right">{scannedPayment.pixKey}</Text>
		    </HStack>
		  ) : (
		    <HStack className="justify-between">
		      <Text className="text-white font-bold">Identifier:</Text>
		      <Text className="text-white text-right">{scannedPayment.txid}</Text>
		    </HStack>
		  )}
		</VStack>
		{/* Emigro Fee Breakdown */}
		{(() => {
		  const hasPct   = typeof feePctRaw === 'number' && feePctRaw > 0;
		  const hasFixed = typeof fixedFeeBrl === 'number' && fixedFeeBrl > 0;
		  const showFees = hasPct || hasFixed;

		  if (!showFees) return null;

		  // Build breakdown parts only for the fees that exist
		  const parts: string[] = [];
		  if (hasFixed) parts.push(`${fmtBRL(fixedFeeBrl)}`);
		  if (hasPct)   parts.push(`${pctPercent.toFixed(2)} %`);
		  const breakdown = parts.length ? ` (${parts.join(' + ')})` : '';

		  return (
		    <VStack className="mb-2 mt-[-6]">
		      <HStack className="justify-between">
		        <Text className="text-white font-bold">Emigro fees:</Text>
		        <Text className="text-white text-right">
		          {fmtBRL(premiumBrl)}{breakdown}
		        </Text>
		      </HStack>

		      <HStack className="justify-between">
		        <Text className="text-white font-bold">Final Amount:</Text>
		        <Text className="text-white text-right">
		          {fmtBRL(finalBrl ?? scannedPayment.transactionAmount)}
		        </Text>
		      </HStack>
		    </VStack>
		  );
		})()}



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
				? formatAmountWithPrecision(totalQuoteWithGas, asset?.symbol === 'USDC')

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
		{chain.supportsPaymaster && chain.gasFeeSponsored !== 1 && (
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

		{/* Insufficient balance alert */}
		{insufficientBalance && (
		  <Box className="bg-[#2B0000] border border-[#FF3B30] rounded-lg px-3 py-2 mt-3 mb-1">
		    <Text className="text-white font-semibold">Insufficient balance</Text>
		    <Text className="text-[#FFB4B0]">
		      You don&apos;t have enough {asset?.symbol} to cover this payment. Deposit funds or select another currency.
		    </Text>
		  </Box>
		)}
		
		{/* Pay Button */}
		<Button
		  onPress={handleConfirm}
		  className="mt-6 bg-[#FF0050] h-14"
		  style={{ borderRadius: 12, opacity: (isLoadingEssentialData || usdQuote === null || isConfirming || insufficientBalance) ? 0.6 : 1 }}
		  disabled={isLoadingEssentialData || usdQuote === null || isConfirming || insufficientBalance}
		>
		  <ButtonText className="text-white text-2xl">
		    {isConfirming ? 'Processing...' : 'Pay now'}
		  </ButtonText>
		</Button>




	    {/* Quote Timer */}

	    <Text className="text-white text-sm text-center text-lg">
	      New quote in <Text className="font-bold">{quoteCountdown}</Text> seconds
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

	<SelectAssetSheet
	  isOpen={assetWalletModalVisible}
	  onClose={() => setAssetWalletModalVisible(false)}
	  wallets={wallets}
	  chains={chains}
	  initialWalletId={selectedWalletId}
	  onSelect={(walletId, assetId) => {
	    setSelectedWalletId(walletId);
	    setSelectedAssetId(assetId);
	    setAssetWalletModalVisible(false);
	  }}
	/>

		  </>
		)}


		    </>
		  );
		};


export default observer(ConfirmPayment);
