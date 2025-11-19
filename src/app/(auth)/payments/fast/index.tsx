import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
  CameraView,
  PermissionResponse,
  PermissionStatus,
  useCameraPermissions,
} from 'expo-camera';
import { Stack, useRouter } from 'expo-router';
import { PixElementType, hasError, parsePix } from 'pix-utils';

import { Box } from '@/components/ui/box';
import { Center } from '@/components/ui/center';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { INVALID_QR_CODE } from '@/constants/errorMessages';
import { LoadingScreen } from '@/screens/Loading';
import { api } from '@/services/emigro/api';
import { sessionStore } from '@/stores/SessionStore';
import { brCodeFromMercadoPagoUrl } from '@/utils/pix';
import { fetchQuote, fetchFiatQuote, fetchDirectFiatPairQuote } from '@/services/emigro/quotes';
import uuid from 'react-native-uuid';

import { useRef } from 'react';
import { Animated } from 'react-native';

import { assetIconMap } from '@/utils/assetIcons';
import { chainIconMap } from '@/utils/chainIconMap';
import { useChainStore } from '@/stores/ChainStore';
import { balanceStore } from '@/stores/BalanceStore';
import { Image } from 'react-native';

import { useIsFocused } from '@react-navigation/native';

import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import LottieView from 'lottie-react-native';

import { useLocalSearchParams } from 'expo-router';
import { paymentStore } from '@/stores/PaymentStore';

import * as Sentry from '@sentry/react-native';
import { observer } from 'mobx-react-lite';

const FastQRCodeScreen = () => {
  const router = useRouter();
  const [primaryAsset, setPrimaryAsset] = useState(null);
  const [primaryChain, setPrimaryChain] = useState(null);
  const params = useLocalSearchParams();
  const resumeFast = params?.resume === '1';
  const [resumeInProgress, setResumeInProgress] = useState<boolean>(resumeFast);
  const [primaryBalance, setPrimaryBalance] = useState<number | null>(null);
  const userBalance = balanceStore.userBalance; // read observable during render for MobX reactivity

  
  // If returning from /payments/pix/enter-amount with a just-entered amount,
  // we re-use the stored scanned payment from the store and run the same success path.
  useEffect(() => {
    (async () => {
      if (!resumeFast) return;

      try {
        const stored = paymentStore.scannedPayment;
        if (!stored) return;

        // Trigger the same flow as a successful scan, but with the updated amount from the store
        await (async (pixPayload) => {
          try {
            console.log('[FastQRCode][resume] ✅ Using stored payload:', pixPayload);

            const userId = sessionStore.user?.id;
            if (!userId) throw new Error('User not logged in');

            const res = await api().get('/user/primary-currency');
            const primary = res.data;

            console.log('[FastQRCode][resume] 🪙 Primary currency:', primary);

            const assetRes = await api().get(`/assets/${primary.assetId}`);
            console.log('[FastQRCode][resume] 🧾 Full asset response:', assetRes.data);

            const tokenAddress = assetRes.data.contractAddress;
            const decimals = assetRes.data.decimals;
            const assetSymbol = assetRes.data.symbol;

            let quotedAmount;

            try {
              const parsedPixDump = JSON.stringify(pixPayload).slice(0, 400);
              let transactionAmount = pixPayload.transactionAmount;

              if (
                transactionAmount == null ||
                isNaN(transactionAmount) ||
                transactionAmount <= 0
              ) {
                throw new Error(
                  `Missing transaction amount on resume. Parsed PIX: ${parsedPixDump}`
                );
              }

              const brlAmount = Number(pixPayload.transactionAmount.toFixed(2));
              console.log('[FastQRCode][resume] 🛰 Fetching USDC/BRL price via /quote?asset=USDC&fiat=BRL...', {
                brlAmount,
              });

              const usdcBrlPrice = await fetchDirectFiatPairQuote('USDC', 'BRL'); // price of 1 USDC in BRL
              if (!usdcBrlPrice || isNaN(usdcBrlPrice) || usdcBrlPrice <= 0) {
                throw new Error(`[FiatPair] Invalid USDC/BRL price: ${usdcBrlPrice}. Parsed PIX: ${parsedPixDump}`);
              }

              const usdcAmount = brlAmount / usdcBrlPrice; // how many USDC to cover BRL amount
              console.log('[FastQRCode][resume] 💵 USDC amount (derived):', usdcAmount);

              if (!usdcAmount || isNaN(usdcAmount) || usdcAmount <= 0) {
                throw new Error(
                  `USDC conversion returned invalid amount: ${usdcAmount}. Parsed PIX: ${parsedPixDump}`
                );
              }

              if (assetSymbol === 'USDC') {
                quotedAmount = usdcAmount;
              } else {
                console.log(`[FastQRCode][resume] 🔁 Fetching USD → ${assetSymbol} price`);
                const tokenPrice = await fetchFiatQuote(assetSymbol, 'USD');
                if (!tokenPrice || isNaN(tokenPrice) || tokenPrice <= 0) {
                  throw new Error(
                    `Token price not found or invalid for symbol: ${assetSymbol}. Value: ${tokenPrice}. Parsed PIX: ${parsedPixDump}`
                  );
                }
                quotedAmount = usdcAmount / tokenPrice;
                if (!quotedAmount || isNaN(quotedAmount) || quotedAmount <= 0) {
                  throw new Error(
                    `Converted token amount is invalid. Result: ${quotedAmount}, USDC: ${usdcAmount}, TokenPrice: ${tokenPrice}. Parsed PIX: ${parsedPixDump}`
                  );
                }
                console.log('[FastQRCode][resume] 🔁 Converted token amount:', quotedAmount);
              }
            } catch (err) {
              console.error('[FastQRCode][resume] ❌ Quote fetch failed:', err);
              Sentry.captureException(err, {
                tags: { feature: 'quoteConversion' },
                extra: {
                  pixPayload,
                  assetSymbol,
                  transactionAmount: pixPayload?.transactionAmount,
                },
              });
              const debugMessage = [
                '[QR Quote Error]',
                `Message: ${err?.message}`,
                `Symbol: ${assetSymbol}`,
                `Amount: ${pixPayload?.transactionAmount}`,
              ].join(' | ');
              throw new Error(debugMessage);
            }

			// Resolve the correct Circle wallet ID for the primary chain
			const circleWalletIdForPrimaryChain = (() => {
			  const wallets = sessionStore.user?.wallets || [];
			  // primary.chainId is the DB UUID in most of your APIs; primary.chainIdOnchain is the EVM number.
			  // Your DB wallet rows use chain_id (UUID). Compare against primary.chainId (not chainIdOnchain).
			  const match = wallets.find(
			    (w: any) => String(w.chain_id) === String(primary.chainId)
			  );
			  // Fallback to the old single-wallet field if nothing matched (keeps previous behavior)
			  return match?.circle_wallet_id || sessionStore.user?.circleWallet?.circleWalletId || null;
			})();

            const rawAmount = Math.floor(quotedAmount * Math.pow(10, decimals)).toString();

			const payload = {
			  paymentId: `${Date.now()}_${uuid.v4()}`,
			  token: tokenAddress,
			  amount: rawAmount,
			  usePaymaster: true,
			  chainId: Number(primary.chainIdOnchain),
			  walletId: circleWalletIdForPrimaryChain,
			  assetId: primary.assetId,
			  tokenSymbol: assetSymbol,
			  rawBrcode: pixPayload.brCode,
			  transferoTxid: pixPayload.txid,
			  taxId: pixPayload.taxId ?? '55479337000115',
			  name: pixPayload.merchantName ?? '',
			  pixKey: pixPayload.pixKey ?? '',
			  fiatAmount: pixPayload.transactionAmount.toFixed(6),
			  toTokenAmount: quotedAmount.toFixed(6),
			};


            console.log('[FastQRCode][resume] 📦 Payload to send:', payload);

            const response = await api().post('/evm/create-escrow-evm', payload);
            console.log('[FastQRCode][resume] ✅ Escrow created:', response.data);

            router.replace({
              pathname: '/payments/confirm/status',
              params: { id: payload.paymentId },
            });
          } catch (error) {
            console.error('[FastQRCode][resume] ❌ Failed to process payment:', error);

            Sentry.captureException(error, {
              tags: { feature: 'onScanSuccess' },
              extra: {
                pixPayload,
                userId: sessionStore.user?.id,
                wallet: sessionStore.user?.circleWallet,
              },
            });

            router.replace({
              pathname: '/payments/confirm/status',
              params: {
                id: 'error',
                message: encodeURIComponent(
                  error?.message || 'Unknown error while processing QR code'
                ),
              },
            });
          }
        })(stored);
      } catch {}
    })();
  }, [resumeFast]);

  
  useFocusEffect(
    useCallback(() => {
      // keep it light; cached fetch in store prevents spam
      balanceStore.fetchUserBalance().catch(() => {});
    }, [])
  );

  
  useEffect(() => {
    const fetchPrimary = async () => {
      try {
        console.log('[FastQRCode] 🔄 Fetching primary currency...');
        const res = await api().get('/user/primary-currency');
        const primary = res.data;
        console.log('[FastQRCode] 🪙 Primary currency response:', primary);

        const assetRes = await api().get(`/assets/${primary.assetId}`);
        const asset = assetRes.data;
        console.log('[FastQRCode] 📦 Asset data:', asset);

        console.log('[FastQRCode] 🌐 Requesting chain info from:', `/chains/${primary.chainId}`);
        const chainRes = await api().get(`/chains/${primary.chainId}`);
        const chain = chainRes.data;
        console.log('[FastQRCode] 🔗 Chain data:', chain);

		// icons
		const assetIcon = assetIconMap[(asset?.symbol || '').toLowerCase()];
		// IMPORTANT: keys in chainIconMap are exact iconUrl values; do NOT lowercase
		const chainIcon = chain?.iconUrl ? chainIconMap[chain.iconUrl] : null;

		// IMPORTANT: always use the API primary.assetId (DB UUID), not asset.id
		setPrimaryAsset({
		  assetId: primary.assetId,           // <-- fixed
		  chainId: String(primary.chainId),   // keep chain for disambiguation
		  symbol: asset.symbol,
		  decimals: asset.decimals ?? 6,
		  icon: assetIcon,
		});

		setPrimaryChain({
		  id: String(primary.chainId),
		  name: chain?.name ?? '',
		  icon: chainIcon,
		});

		console.log('[FastQRCode] ✅ Set primaryAsset:', {
		  assetId: primary.assetId,
		  chainId: String(primary.chainId),
		  symbol: asset.symbol,
		  icon: !!assetIcon,
		});

		console.log('[FastQRCode] ✅ Set primaryChain:', {
		  id: String(primary.chainId),
		  name: chain?.name ?? '',
		  hasIcon: !!chainIcon,
		});

      } catch (e) {
        console.warn('[FastQRCode] ❌ Failed to fetch primary asset info:', e);
        Sentry.captureException(e, {
          tags: { feature: 'fetchPrimaryCurrency' },
          extra: { reason: 'Error during currency/asset/chain fetch' },
        });
      }
    };

    fetchPrimary();
  }, []);

  useEffect(() => {
    if (!primaryAsset?.assetId && !primaryAsset?.symbol) {
      setPrimaryBalance(null);
      return;
    }

    const all = userBalance ?? [];

    // Prefer exact DB assetId match; fallback to (symbol + chain) to avoid cross-chain collisions.
    const match = all.find((b: any) => {
      const sameAssetId =
        b?.assetId != null &&
        primaryAsset?.assetId != null &&
        String(b.assetId) === String(primaryAsset.assetId);

      const sameSymbolAndChain =
        !!b?.symbol &&
        !!primaryAsset?.symbol &&
        b.symbol.toUpperCase() === String(primaryAsset.symbol).toUpperCase() &&
        (primaryAsset?.chainId == null ||
          String(b.chainId) === String(primaryAsset.chainId));

      return sameAssetId || sameSymbolAndChain;
    });

    // Be resilient to strings/undefined
    const qty = parseFloat(String(match?.balance ?? '0'));
    setPrimaryBalance(Number.isFinite(qty) ? qty : 0);
  }, [primaryAsset?.assetId, primaryAsset?.symbol, primaryAsset?.chainId, userBalance]);



  
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
	  <FastQRCodeScanner
	    onCancel={() => {
	      router.push('/wallet');
	    }}
	    primaryAsset={primaryAsset}
	    primaryChain={primaryChain}
		primaryBalance={primaryBalance}
	    isLoading={resumeInProgress || !primaryAsset || !primaryChain}
	    onScanSuccess={async (pixPayload) => {
          try {
            console.log('[FastQRCode] ✅ Scanned payload:', pixPayload);

            const userId = sessionStore.user?.id;
            if (!userId) throw new Error('User not logged in');

            const res = await api().get('/user/primary-currency');
            const primary = res.data;

            console.log('[FastQRCode] 🪙 Primary currency:', primary);

            const assetRes = await api().get(`/assets/${primary.assetId}`);
            console.log('[FastQRCode] 🧾 Full asset response:', assetRes.data);

            const tokenAddress = assetRes.data.contractAddress;
            const decimals = assetRes.data.decimals;
            const assetSymbol = assetRes.data.symbol;

            let quotedAmount;

			try {
				const parsedPixDump = JSON.stringify(pixPayload).slice(0, 400); // truncate large payload

				let transactionAmount = pixPayload.transactionAmount;

				if (
				  transactionAmount == null ||
				  isNaN(transactionAmount) ||
				  transactionAmount <= 0
				) {
				  console.warn('[FastQRCode] ⚠️ Falling back to Transfero /payment-preview for dynamic QR');

				  try {
				    const preview = await api().post('/transfero/payment-preview', {
				      id: pixPayload.brCode,
				    });

				    if (
				      preview?.data?.amount != null &&
				      !isNaN(preview.data.amount) &&
				      Number(preview.data.amount) > 0
				    ) {
				      transactionAmount = Number(preview.data.amount);
				      pixPayload.transactionAmount = transactionAmount;
				      pixPayload.merchantName =
				        pixPayload.merchantName || preview.data.name || 'Unknown Merchant';
				      pixPayload.taxId =
				        pixPayload.taxId || preview.data.taxId || '55479337000115';
				      pixPayload.pixKey =
				        pixPayload.pixKey || preview.data.brCode?.keyId;

				      console.log('[FastQRCode] ✅ Fallback succeeded. Amount:', transactionAmount);
				    } else {
				      // ⚠️ No valid amount from Transfero — do NOT throw.
				      console.warn(
				        '[FastQRCode] ⚠️ Transfero fallback returned invalid amount. Preview:',
				        preview?.data
				      );
				    }
				  } catch (fallbackError) {
				    // ⚠️ Network/Transfero error — do NOT throw. We’ll ask the user for the value next.
				    console.warn(
				      '[FastQRCode] ⚠️ Transfero /payment-preview failed:',
				      fallbackError
				    );
				  }


				}

				if (
				  transactionAmount == null ||
				  isNaN(transactionAmount) ||
				  transactionAmount <= 0
				) {
				  // Save scanned payload, then redirect user to enter amount; we'll resume this flow afterwards
				  try {
				    paymentStore.setScannedPayment({
				      ...pixPayload,
				      transactionAmount: 0, // explicit 0 to mark missing
				    });
				  } catch (e) {
				    console.warn('[FastQRCode] ⚠️ Could not persist scanned payload in store:', e);
				  }

				  router.push({
				    pathname: '/payments/pix/enter-amount',
				    params: { returnTo: '/payments/fast?resume=1' }, // will trigger the resume effect
				  });
				  return;
				}



			  const brlAmount = pixPayload.transactionAmount.toFixed(2);

			  console.log('[FastQRCode] 🛰 Fetching USDC/BRL price via /quote?asset=USDC&fiat=BRL...', {
			    brlAmount,
			  });

			  const usdcBrlPrice = await fetchDirectFiatPairQuote('USDC', 'BRL'); // price of 1 USDC in BRL

			  if (!usdcBrlPrice || isNaN(usdcBrlPrice) || usdcBrlPrice <= 0) {
			    throw new Error(`[FiatPair] Invalid USDC/BRL price: ${usdcBrlPrice}. Parsed PIX: ${parsedPixDump}`);
			  }

			  // brlAmount is string; convert to number safely
			  const brlAmtNum = Number(brlAmount);
			  if (isNaN(brlAmtNum) || brlAmtNum <= 0) {
			    throw new Error(`[FiatPair] Invalid BRL amount: ${brlAmount}. Parsed PIX: ${parsedPixDump}`);
			  }

			  const usdcAmount = brlAmtNum / usdcBrlPrice; // how many USDC to cover BRL amount
			  console.log('[FastQRCode] 💵 USDC amount (derived):', usdcAmount);


			  console.log('[FastQRCode] 💵 USDC amount:', usdcAmount);

			  if (!usdcAmount || isNaN(usdcAmount) || usdcAmount <= 0) {
			    const responseDump = JSON.stringify(toUsdc).slice(0, 300);
			    throw new Error(
			      `USDC quote returned invalid amount: ${usdcAmount}. Full response: ${responseDump}. Parsed PIX: ${parsedPixDump}`
			    );
			  }

			  if (assetSymbol === 'USDC') {
			    quotedAmount = usdcAmount;
			  } else {
			    console.log(`[FastQRCode] 🔁 Fetching USD → ${assetSymbol} price`);

			    const tokenPrice = await fetchFiatQuote(assetSymbol, 'USD');

			    if (!tokenPrice || isNaN(tokenPrice) || tokenPrice <= 0) {
			      throw new Error(
			        `Token price not found or invalid for symbol: ${assetSymbol}. Value: ${tokenPrice}. Parsed PIX: ${parsedPixDump}`
			      );
			    }

			    quotedAmount = usdcAmount / tokenPrice;

			    if (!quotedAmount || isNaN(quotedAmount) || quotedAmount <= 0) {
			      throw new Error(
			        `Converted token amount is invalid. Result: ${quotedAmount}, USDC: ${usdcAmount}, TokenPrice: ${tokenPrice}. Parsed PIX: ${parsedPixDump}`
			      );
			    }

			    console.log('[FastQRCode] 🔁 Converted token amount:', quotedAmount);
			  }

			} catch (err) {
			  console.error('[FastQRCode] ❌ Quote fetch failed:', err);

			  Sentry.captureException(err, {
			    tags: { feature: 'quoteConversion' },
			    extra: {
			      pixPayload,
			      assetSymbol,
			      transactionAmount: pixPayload?.transactionAmount,
			    },
			  });

			  const debugMessage = [
			    '[QR Quote Error]',
			    `Message: ${err?.message}`,
			    `Symbol: ${assetSymbol}`,
			    `Amount: ${pixPayload?.transactionAmount}`,
			  ].join(' | ');

			  throw new Error(debugMessage);
			}


			// Resolve the correct Circle wallet ID for the primary chain
			const circleWalletIdForPrimaryChain = (() => {
			  const wallets = sessionStore.user?.wallets || [];
			  const match = wallets.find(
			    (w: any) => String(w.chain_id) === String(primary.chainId)
			  );
			  return match?.circle_wallet_id || sessionStore.user?.circleWallet?.circleWalletId || null;
			})();

            const rawAmount = Math.floor(quotedAmount * Math.pow(10, decimals)).toString();

			const payload = {
			  paymentId: `${Date.now()}_${uuid.v4()}`,
			  token: tokenAddress,
			  amount: rawAmount,
			  usePaymaster: true,
			  chainId: Number(primary.chainIdOnchain),
			  walletId: circleWalletIdForPrimaryChain,
			  assetId: primary.assetId,
			  tokenSymbol: assetSymbol,
			  rawBrcode: pixPayload.brCode,
			  transferoTxid: pixPayload.txid,
			  taxId: pixPayload.taxId ?? '55479337000115',
			  name: pixPayload.merchantName ?? '',
			  pixKey: pixPayload.pixKey ?? '',
			  fiatAmount: pixPayload.transactionAmount.toFixed(6),
			  toTokenAmount: quotedAmount.toFixed(6),
			};


            console.log('[FastQRCode] 📦 Payload to send:', payload);

            const response = await api().post('/evm/create-escrow-evm', payload);
            console.log('[FastQRCode] ✅ Escrow created:', response.data);

            router.replace({
              pathname: '/payments/confirm/status',
              params: { id: payload.paymentId },
            });
          } catch (error) {
            console.error('[FastQRCode] ❌ Failed to process payment:', error);

            Sentry.captureException(error, {
              tags: { feature: 'onScanSuccess' },
              extra: {
                pixPayload,
                userId: sessionStore.user?.id,
                wallet: sessionStore.user?.circleWallet,
              },
            });

            router.replace({
              pathname: '/payments/confirm/status',
              params: {
                id: 'error',
                message: encodeURIComponent(
                  error?.message || 'Unknown error while processing QR code'
                ),
              },
            });
          }
        }}
      />
    </>
  );
};



const FastQRCodeScanner = ({ onCancel, onScanSuccess, primaryAsset, primaryChain, primaryBalance, isLoading }) => {

  const insets = useSafeAreaInsets();
  const [cameraPermission, setCameraPermission] = useState<PermissionResponse | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [isScanned, setIsScanned] = useState(false);
  const isScannedRef = useRef(false);
  const [error, setError] = useState('');

  const [permission] = useCameraPermissions();

  const isFocused = useIsFocused();
  const router = useRouter();

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const handleFeedback = async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const { sound } = await Audio.Sound.createAsync(
        require('@/assets/sounds/success.mp3')
      );
      await sound.playAsync();
    } catch (err) {
      console.warn('[FastQRCode] ⚠️ Feedback error:', err);
      Sentry.captureException(err, {
        tags: { feature: 'handleFeedback' },
        extra: { reason: 'Failed to vibrate or play success sound' },
      });
    }
  };

  useEffect(() => setCameraPermission(permission), [permission]);

  useFocusEffect(
    useCallback(() => {
      // Keep flags during navigation; clear only when leaving the screen.
      return () => {
        setIsScanned(false);
        isScannedRef.current = false;
        setError('');
      };
    }, [])
  );


  const parseQRCode = (scanned: string) => {
    console.log('[FastQRCode] 🔍 Raw QR code scanned:', scanned);

    if (scanned.startsWith('https://qr.mercadopago.com')) {
      const merchantName = 'Mercado Pago';
      const merchantCity = '';
      scanned = brCodeFromMercadoPagoUrl(scanned, merchantName, merchantCity);
      console.log('[FastQRCode] 🔁 Converted MercadoPago brCode:', scanned);
    }

    const pix = parsePix(scanned);
    console.log('[FastQRCode] 📤 Parsed pix data:', pix);

    if (hasError(pix) || pix.type === PixElementType.INVALID) {
      const err = new Error(INVALID_QR_CODE);
      Sentry.captureException(err, {
        tags: { feature: 'parseQRCode' },
        extra: { rawData: scanned, parsedData: pix },
      });
      throw err;
    }

    return { ...pix, brCode: scanned };
  };

  const handleBarCodeScanned = async ({ data }) => {
    console.log('[FastQRCode] 📸 Barcode detected:', data);

    if (isScannedRef.current) return;
    isScannedRef.current = true;
    setIsScanned(true);

    try {
      const pixPayload = parseQRCode(data);

      Sentry.setContext('PixPayload', {
        txid: pixPayload?.txid,
        pixKey: pixPayload?.pixKey,
        merchantName: pixPayload?.merchantName,
        amount: pixPayload?.transactionAmount,
        brCode: pixPayload?.brCode,
      });

      await handleFeedback();
      await onScanSuccess(pixPayload);
    } catch (err) {
      console.warn('[FastQRCode] ❌ Invalid QR:', err);

      Sentry.captureException(err, {
        tags: { feature: 'handleBarCodeScanned' },
        extra: {
          scannedData: data,
          primaryAsset,
          primaryChain,
          message: err?.message,
          stack: err?.stack,
        },
      });

      setError(INVALID_QR_CODE);
      setIsScanned(false);
      isScannedRef.current = false;

      router.replace({
        pathname: '/payments/confirm/status',
        params: {
          id: 'error',
          message: encodeURIComponent(err?.message || 'Invalid QR code scanned.'),
        },
      });
    }
  };

  if (isLoading || isScanned || cameraPermission?.status === PermissionStatus.UNDETERMINED) {
    return <LoadingScreen />;
  }

  if (!cameraPermission?.granted) {
    return (
		<Box className="flex-1 bg-background-900 justify-center items-center px-6">
		  <Text size="md" className="text-gray-400 text-center text-2xl">
		    Camera Access Denied
		  </Text>

		  <LottieView
		    source={require('@/assets/lotties/error.json')}
		    autoPlay
		    loop={false}
		    style={{ width: 180, height: 180, marginTop: 20 }}
		  />

		  <Text size="md" className="text-white text-center mt-6">
		    Please enable camera permissions in your device settings to scan QR codes.
		  </Text>
		</Box>

    );
  }

  if (isScanned) return <LoadingScreen />;


  return (
    <>
	<Stack.Screen options={{ headerShown: false, animation: 'slide_from_bottom' }} />
	{isFocused && (
	<Box className="flex-1">
	  <CameraView
	    style={styles.camera}
	    onCameraReady={() => {
	      console.log('[FastQRCode] 📷 Camera ready');
	      setCameraReady(true);
	    }}
	    onBarcodeScanned={handleBarCodeScanned}
	    barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
		enableZoomGesture={false}
	  >

	    {/* QR Scan Area */}
	    {cameraReady && (
	      <View style={styles.rectangleContainer}>
	        <View style={styles.rectangle} />
	        <Text className="text-white mt-4 text-xl">Scan QR to Pay</Text>
	        {error ? <Text className="text-red-500 mt-2">{error}</Text> : null}
	      </View>
	    )}

	    {/* Return to App Button (animated) */}
		<View style={{ marginBottom: 110, alignItems: 'center' }}>

		  <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
		    <Pressable
		      onPressIn={animatePress}
		      onPress={onCancel}
		      className="bg-primary-500 rounded-full py-4 px-12 items-center justify-center mb-4"
		    >
		      <Text className="text-white font-bold text-lg">See "My Wallet"</Text>
		    </Pressable>
		  </Animated.View>

		  {(primaryAsset?.symbol || primaryChain?.name) && (
		    <View style={{ alignItems: 'center' }}>
		      <Text style={{ color: '#aaa', fontSize: 18, marginBottom: 4, fontWeight: '600' }}>
		        Your primary currency is
		      </Text>

		      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
		        {primaryAsset?.icon && (
		          <Image
		            source={primaryAsset.icon}
		            style={{ width: 20, height: 20, marginRight: 6 }}
		            resizeMode="contain"
		          />
		        )}
		        {primaryAsset?.symbol && (
		          <Text style={{ color: '#aaa', fontSize: 16, marginRight: 6 }}>
		            {primaryAsset.symbol} on
		          </Text>
		        )}
		        {primaryChain?.icon && (
		          <Image
		            source={primaryChain.icon}
		            style={{ width: 20, height: 20, marginRight: 6 }}
		            resizeMode="contain"
		          />
		        )}
		        {primaryChain?.name && (
		          <Text style={{ color: '#aaa', fontSize: 16 }}>
		            {primaryChain.name}
		          </Text>
		        )}


		      </View>
			  {typeof primaryBalance === 'number' && (primaryAsset?.symbol || primaryChain?.name) && (
			    <Text
			      style={{
			        color: '#aaa',
			        fontSize: 15,
			        marginTop: 8,
			        fontWeight: '400',
			        textAlign: 'center',
			      }}
			    >
			      {`Balance: ${Number(primaryBalance).toFixed(6).replace(/\.?0+$/, '')}${primaryAsset?.symbol ? ` ${primaryAsset.symbol}` : ''}`}
			    </Text>
			  )}

		    </View>
		  )}

		</View>

	  </CameraView>
	</Box>
	)}


    </>
  );
};

const styles = StyleSheet.create({
  camera: { flex: 1 },
  topBar: { flexDirection: 'row', backgroundColor: 'transparent' },
  rectangleContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  rectangle: {
    height: 220,
    width: 220,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    borderRadius: 15,
    borderStyle: 'dashed',
  },
  returnButtonContainer: {
    paddingBottom: 20,       // margin bottom space
    width: '100%',           // full width container for centering
    alignItems: 'center',    // center horizontally
    justifyContent: 'flex-end', // align to bottom of container if needed
    backgroundColor: 'transparent', // ensure no background blocking touches
  },
  
});

export default observer(FastQRCodeScreen);

