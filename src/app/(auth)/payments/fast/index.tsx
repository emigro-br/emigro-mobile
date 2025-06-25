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
import { fetchQuote, fetchFiatQuote } from '@/services/emigro/quotes';
import uuid from 'react-native-uuid';

import { useRef } from 'react';
import { Animated } from 'react-native';

import { assetIconMap } from '@/utils/assetIcons';
import { chainIconMap } from '@/utils/chainIconMap';
import { useChainStore } from '@/stores/ChainStore';
import { Image } from 'react-native';

import { useIsFocused } from '@react-navigation/native';

import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import LottieView from 'lottie-react-native';

import * as Sentry from '@sentry/react-native';

const FastQRCodeScreen = () => {
  const router = useRouter();
  const [primaryAsset, setPrimaryAsset] = useState(null);
  const [primaryChain, setPrimaryChain] = useState(null);

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

        const assetIcon = assetIconMap[asset.symbol.toLowerCase()];
        const chainIcon = chain.iconUrl
          ? chainIconMap[chain.iconUrl.toLowerCase()]
          : null;

        setPrimaryAsset({
          symbol: asset.symbol,
          icon: assetIcon,
        });

        setPrimaryChain({
          name: chain.name ?? '',
          icon: chainIcon,
        });

        console.log('[FastQRCode] ✅ Set primaryAsset:', {
          symbol: asset.symbol,
          icon: assetIcon,
        });

        console.log('[FastQRCode] ✅ Set primaryChain:', {
          name: chain.name ?? '',
          icon: chainIcon,
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

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <FastQRCodeScanner
        onCancel={() => {
          router.push('/wallet');
        }}
        primaryAsset={primaryAsset}
        primaryChain={primaryChain}
        isLoading={!primaryAsset || !primaryChain}
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
				      !preview?.data?.amount ||
				      isNaN(preview.data.amount) ||
				      preview.data.amount <= 0
				    ) {
				      throw new Error(
				        `Transfero fallback failed or returned invalid amount. Preview: ${JSON.stringify(preview.data)}`
				      );
				    }

				    transactionAmount = Number(preview.data.amount);
				    pixPayload.transactionAmount = transactionAmount;
				    pixPayload.merchantName =
				      pixPayload.merchantName || preview.data.name || 'Unknown Merchant';
				    pixPayload.taxId =
				      pixPayload.taxId || preview.data.taxId || '55479337000115';
				    pixPayload.pixKey =
				      pixPayload.pixKey || preview.data.brCode?.keyId;

				    console.log('[FastQRCode] ✅ Fallback succeeded. Amount:', transactionAmount);
				  } catch (fallbackError) {
				    throw new Error(
				      `Fallback to Transfero /payment-preview failed: ${fallbackError?.message}`
				    );
				  }

				}

				if (
				  transactionAmount == null ||
				  isNaN(transactionAmount) ||
				  transactionAmount <= 0
				) {
				  throw new Error(
				    `Invalid or missing transaction amount in QR code (after fallback). Received: ${transactionAmount}. Parsed PIX: ${parsedPixDump}`
				  );
				}


			  const brlAmount = pixPayload.transactionAmount.toFixed(2);

			  console.log('[FastQRCode] 🛰 Fetching BRL → USDC quote...', {
			    from: 'BRL',
			    to: 'USDC',
			    amount: brlAmount,
			    type: 'strict_send',
			  });

			  const toUsdc = await fetchQuote({
			    from: 'BRL',
			    to: 'USDC',
			    amount: brlAmount,
			    type: 'strict_send',
			  });

			  if (!toUsdc || typeof toUsdc !== 'object') {
			    const responseDump = JSON.stringify(toUsdc).slice(0, 300);
			    throw new Error(
			      `fetchQuote returned null or malformed response: ${responseDump}. Parsed PIX: ${parsedPixDump}`
			    );
			  }

			  const usdcAmount = Number(toUsdc?.destination_amount);

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



            const rawAmount = Math.floor(quotedAmount * Math.pow(10, decimals)).toString();

            const payload = {
              paymentId: `${Date.now()}_${uuid.v4()}`,
              token: tokenAddress,
              amount: rawAmount,
              usePaymaster: true,
              chainId: primary.chainIdOnchain,
              walletId: sessionStore.user.circleWallet?.circleWalletId,
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



const FastQRCodeScanner = ({ onCancel, onScanSuccess, primaryAsset, primaryChain, isLoading }) => {
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
      setIsScanned(false);
      isScannedRef.current = false;
      setError('');
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
		<View style={{ marginBottom: 60, alignItems: 'center' }}>
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

export default FastQRCodeScreen;
