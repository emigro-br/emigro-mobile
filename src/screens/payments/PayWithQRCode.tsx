import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Ionicons } from '@expo/vector-icons';
import { Box, Center, Pressable, Text, View } from '@gluestack-ui/themed';
import { BarCodeScanner, PermissionResponse } from 'expo-barcode-scanner';
import { BarCodeScanningResult } from 'expo-camera/build/Camera.types';
import { CameraView, PermissionStatus, useCameraPermissions } from 'expo-camera/next';

import { IVendor } from '@/types/IVendor';

import { INVALID_QR_CODE } from '@constants/errorMessages';

import { PaymentStackParamList } from '@navigation/PaymentsStack';

import AskCamera from '@screens/AskCamera';

import { paymentStore } from '@stores/PaymentStore';

type ScreenProps = {
  navigation: NativeStackNavigationProp<PaymentStackParamList, 'PayWithQRCode'>;
};

export const PayWithQRCode = ({ navigation }: ScreenProps) => {
  return (
    <QRCodeScanner
      onCancel={() => navigation.goBack()}
      onScanPayment={(payment) => {
        paymentStore.setScannedPayment(payment);
        navigation.push('ConfirmPayment');
      }}
    />
  );
};

type Props = {
  onCancel: () => void;
  onScanPayment: (payment: IVendor) => void;
};

export const QRCodeScanner: React.FC<Props> = ({ onCancel, onScanPayment }) => {
  const [cameraPermission, setCameraPermission] = useState<PermissionResponse | null>(null);
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

  const handleBarCodeScanned = (result: BarCodeScanningResult) => {
    // If a QR code has already been scanned, return early
    if (isScanned) {
      return;
    }

    setIsScanned(true);
    try {
      const qrObject = JSON.parse(result.data);
      if (!qrObject.name || !qrObject.amount || !qrObject.assetCode || !qrObject.publicKey) {
        throw new Error(INVALID_QR_CODE);
      }
      onScanPayment(qrObject);
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
      <Box flex={1} justifyContent="center">
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
    <Pressable right={0} top={0} mt="$8" mr="$8" position="absolute" onPress={onCancel} p="$1">
      <Ionicons name="close" size={36} color="white" />
    </Pressable>
  );

  const InfoText = () => (
    <Center mt="$8">
      <Text size="xl" color="$white" bold>
        Scan a QR code
      </Text>
      <Text size="xl" color="$white" bold mt="$6">
        {error || ' '}
      </Text>
    </Center>
  );

  return (
    <Box flex={1}>
      <CameraView
        onBarcodeScanned={handleBarCodeScanned}
        style={[StyleSheet.absoluteFillObject]}
        barcodeScannerSettings={{
          barcodeTypes: [BarCodeScanner.Constants.BarCodeType.qr], // FIXME: "qr" string is not working
        }}
      >
        <View style={styles.rectangleContainer}>
          <CloseButton />

          <QRRectangule />

          <InfoText />
        </View>
      </CameraView>
    </Box>
  );
};

const styles = StyleSheet.create({
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
