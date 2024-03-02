import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

import { useVendor } from '@contexts/VendorContext';
import { Ionicons } from '@expo/vector-icons';
import {
  Box,
  Button,
  ButtonText,
  Center,
  FormControlErrorText,
  HStack,
  Heading,
  Pressable,
  Text,
  VStack,
  View,
} from '@gluestack-ui/themed';
import { BarCodeScanner, PermissionResponse } from 'expo-barcode-scanner';
import { BarCodeScanningResult } from 'expo-camera/build/Camera.types';
import { CameraView, PermissionStatus, useCameraPermissions } from 'expo-camera/next';

import { CryptoAsset } from '@/types/assets';

import { INVALID_QR_CODE } from '@constants/errorMessages';

import AskCamera from '@screens/AskCamera';

import { AssetToCurrency } from '@utils/assets';

type QRCodeScannerProps = {
  onCancel: () => void;
  onProceedToPayment: () => void;
};

const QRCodeScanner: React.FunctionComponent<QRCodeScannerProps> = ({ onCancel, onProceedToPayment }) => {
  const { scannedVendor, setScannedVendor } = useVendor();
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
      return () => {
        // dismiss the scanner when the user leaves the screen
        onCancel();
      };
    }, []),
  );

  const handleBarCodeScanned = (result: BarCodeScanningResult) => {
    setIsScanned(true);
    try {
      const qrObject = JSON.parse(result.data);
      if (!qrObject.name || !qrObject.amount || !qrObject.assetCode || !qrObject.publicKey) {
        throw new Error(INVALID_QR_CODE);
      }
      setScannedVendor(qrObject);
    } catch (error) {
      console.warn('[handleBarCodeScanned]', error);
      setError(INVALID_QR_CODE);
      setIsScanned(false);
    }
  };

  const handleProceedToPayment = () => {
    onProceedToPayment();
    onCancel();
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

  return (
    <Box flex={1}>
      <Box h="$72" w="$full">
        <CameraView
          onBarcodeScanned={handleBarCodeScanned}
          style={[StyleSheet.absoluteFillObject]}
          barcodeScannerSettings={{
            barcodeTypes: [BarCodeScanner.Constants.BarCodeType.qr], // FIXME: "qr" string is not working
          }}
        >
          <View style={styles.rectangleContainer}>
            <Pressable right={0} top={0} mt="$8" mr="$8" position="absolute" onPress={onCancel}>
              <Ionicons name="close" size={24} color="white" />
            </Pressable>
            <View style={styles.rectangle} />
          </View>
        </CameraView>
      </Box>
      {!isScanned && (
        <Center mt="$8">
          <Heading>Scan the QR code</Heading>
          <Heading>to pay the vendor</Heading>
        </Center>
      )}
      {isScanned && scannedVendor.name ? (
        <VStack p="$4" space="lg">
          <Heading>Confirm the information below:</Heading>
          <VStack space="sm">
            <HStack>
              <Text size="lg" bold>
                Vendor:{' '}
              </Text>
              <Text size="lg">{scannedVendor.name}</Text>
            </HStack>
            <HStack>
              <Text size="lg" bold>
                Address:{' '}
              </Text>
              <Text size="lg">{scannedVendor.address}</Text>
            </HStack>
            <HStack>
              <Text size="lg" bold>
                Amount:{' '}
              </Text>
              <Text size="lg">
                {scannedVendor.amount} {AssetToCurrency[scannedVendor.assetCode as CryptoAsset]}
              </Text>
            </HStack>
          </VStack>
          <Button onPress={handleProceedToPayment}>
            <ButtonText>Proceed to payment</ButtonText>
          </Button>
        </VStack>
      ) : (
        <FormControlErrorText bold m="$4">
          {error}
        </FormControlErrorText>
      )}
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
  },
  rectangleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  rectangle: {
    height: 200,
    width: 200,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: 'transparent',
    borderRadius: 15,
  },
});

export default QRCodeScanner;
