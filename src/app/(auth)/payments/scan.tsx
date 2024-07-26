import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFocusEffect } from '@react-navigation/native';

import { Ionicons } from '@expo/vector-icons';
import {
  BarcodeScanningResult,
  CameraView,
  PermissionResponse,
  PermissionStatus,
  useCameraPermissions,
} from 'expo-camera';
import { Stack, useRouter } from 'expo-router';
import { PixElementType, hasError, parsePix } from 'pix-utils';

import { Spacer } from '@/components/Spacer';
import { Box } from '@/components/ui/box';
import { Center } from '@/components/ui/center';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { INVALID_QR_CODE } from '@/constants/errorMessages';
import { useFeatureFlags } from '@/hooks/feature-flags';
import { paymentStore } from '@/stores/PaymentStore';
import { Payment, emigroCategoryCode } from '@/types/PixPayment';
import { isoToCrypto } from '@/utils/assets';
import { brCodeFromMercadoPagoUrl } from '@/utils/pix';

import AskCamera from './ask-camera';

export const PayWithQRCode = () => {
  const router = useRouter();
  return (
    <QRCodeScanner
      onCancel={() => router.back()}
      onScanPayment={async (scanned) => {
        try {
          const payment = await paymentStore.preview(scanned.brCode);
          paymentStore.setScannedPayment(payment);
          router.push('/payments/confirm');
        } catch (error) {
          // FIXME: how show this error to the user?
          console.warn('[onScanPayment]', error);
        }
      }}
    />
  );
};

type Props = {
  onCancel: () => void;
  onScanPayment: (payment: Payment) => void;
};

export const QRCodeScanner: React.FC<Props> = ({ onCancel, onScanPayment }) => {
  const isFeatureEnabled = useFeatureFlags();
  const enablePix = isFeatureEnabled('pix-payment');
  const insets = useSafeAreaInsets();
  const [cameraPermission, setCameraPermission] = useState<PermissionResponse | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [isScanned, setIsScanned] = useState(false);
  const [error, setError] = useState('');

  // only used when screen starts
  const [permission] = useCameraPermissions();
  useEffect(() => {
    setCameraPermission(permission);
  }, [permission]);

  useFocusEffect(
    useCallback(() => {
      // reset the scanner when the user comes back to the screen
      setIsScanned(false);
      setError('');
    }, []),
  );

  const parseQRCode = (scanned: string): Payment => {
    if (scanned.startsWith('https://qr.mercadopago.com')) {
      // FIXME: hardcoded values
      const merchantName = 'Mercado Pago';
      const merchantCity = '';
      scanned = brCodeFromMercadoPagoUrl(scanned, merchantName, merchantCity);
    }

    const pix = parsePix(scanned);
    if (hasError(pix) || pix.type === PixElementType.INVALID) {
      throw new Error(INVALID_QR_CODE);
    }

    if (pix.merchantCategoryCode === emigroCategoryCode || enablePix) {
      return {
        ...pix,
        brCode: scanned,
        assetCode: isoToCrypto[pix.transactionCurrency as keyof typeof isoToCrypto],
      } as Payment;
    }
    throw new Error(INVALID_QR_CODE);
  };

  const handleBarCodeScanned = (result: BarcodeScanningResult) => {
    // If a QR code has already been scanned, return early
    if (isScanned) {
      return;
    }

    setIsScanned(true);
    try {
      const payment = parseQRCode(result.data);
      onScanPayment(payment);
    } catch (error) {
      console.warn('[handleBarCodeScanned]', error);
      setError(INVALID_QR_CODE);
      setIsScanned(false);
    }
  };

  if (cameraPermission?.status === PermissionStatus.UNDETERMINED) {
    return <AskCamera onAnswer={(newPermission) => setCameraPermission(newPermission)} />;
  }

  if (!cameraPermission?.granted) {
    return (
      <Box className="flex-1 justify-center">
        <Center>
          <Text size="lg">
            Camera access has been denied. Please enable camera access in your device settings to proceed with QR code
            payments.
          </Text>
        </Center>
      </Box>
    );
  }

  const QRRectangule = () => <View style={styles.rectangle} />;
  const CloseButton = () => (
    <Pressable onPress={() => onCancel()} className="p-2 mr-2">
      <Ionicons name="close" size={24} color="white" />
    </Pressable>
  );

  const InfoText = () => (
    <Center className="mt-8">
      <Text size="2xl" bold className="text-white">
        Scan a QR code
      </Text>
      <Text size="xl" bold className="text-white mt-6">
        {error || ' '}
      </Text>
    </Center>
  );

  return (
    <>
      <Stack.Screen options={{ title: 'Scan a Payment', headerShown: false }} />
      <Box className="flex-1">
        <CameraView
          style={[styles.camera]}
          onCameraReady={() => setCameraReady(true)}
          onBarcodeScanned={handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        >
          <View style={{ ...styles.buttonContainer, paddingTop: insets.top }}>
            <Spacer />
            <CloseButton />
          </View>
          {cameraReady && (
            <View style={styles.rectangleContainer}>
              <QRRectangule />
              <InfoText />
            </View>
          )}
        </CameraView>
      </Box>
    </>
  );
};

const styles = StyleSheet.create({
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  rectangleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: 'rgba(0, 0, 0, 0.6)', // not working
  },
  rectangle: {
    height: 220,
    width: 220,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    backgroundColor: 'transparent',
    borderRadius: 15,
    borderStyle: 'dashed',
  },
});

export default PayWithQRCode;
