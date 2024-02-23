import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { BarCodeScanner, PermissionResponse } from 'expo-barcode-scanner';
import { BarCodeScanningResult } from 'expo-camera/build/Camera.types';
import { CameraView, PermissionStatus, useCameraPermissions } from 'expo-camera/next';
import { styled } from 'nativewind';

import Button from '@/components/Button';
import { INVALID_QR_CODE } from '@/constants/errorMessages';
import { useVendor } from '@/contexts/VendorContext';
import { formatAssetCode } from '@/utils/formatAssetCode';

import AskCamera from '@screens/AskCamera';

type QRCodeScannerProps = {
  onCancel: () => void;
  onProceedToPayment: () => void;
};

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

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
      setScannedVendor(qrObject);
    } catch (error) {
      setError(INVALID_QR_CODE);
      setIsScanned(false);
      console.error(error, INVALID_QR_CODE);
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
      <StyledView className="bg-white flex items-center justify-center h-full">
        <StyledText className="text-lg m-4">
          Camera access has been denied. Please enable camera access in your device settings to proceed with QR code
          payments.
        </StyledText>
      </StyledView>
    );
  }

  return (
    <StyledView className="flex items-center h-full bg-white">
      <StyledView className="items-center justify-center h-60 w-full rounded-3xl">
        <CameraView
          onBarcodeScanned={handleBarCodeScanned}
          style={[StyleSheet.absoluteFillObject]}
          barcodeScannerSettings={{
            barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr], // FIXME: "qr" string is not working
          }}
        >
          <StyledView style={styles.rectangleContainer}>
            <StyledTouchableOpacity className="absolute right-0 top-8 mr-8" onPress={onCancel}>
              <Ionicons name="close" size={24} color="white" />
            </StyledTouchableOpacity>
            <StyledView style={styles.rectangle} />
          </StyledView>
        </CameraView>
      </StyledView>
      {!isScanned && (
        <StyledView className="flex flex-col items-center justify-center w-full mt-4">
          <StyledText className="text-lg font-bold">Scan the QR code</StyledText>
          <StyledText className="text-lg font-bold">to pay the vendor</StyledText>
        </StyledView>
      )}
      {isScanned && scannedVendor.name ? (
        <StyledView className="flex flex-col p-4 mt-4 w-full gap-2">
          <StyledText className="text-xl font-bold">Confirm the information below:</StyledText>
          <StyledView className="flex-row">
            <StyledText className="text-lg font-bold">Vendor: </StyledText>
            <StyledText className="text-lg">{scannedVendor.name}</StyledText>
          </StyledView>
          <StyledView className="flex-row">
            <StyledText className="text-lg font-bold">Address: </StyledText>
            <StyledText className="text-lg">{scannedVendor.address}</StyledText>
          </StyledView>
          <StyledView className="flex-row">
            <StyledText className="text-lg font-bold">Amount: </StyledText>
            <StyledText className="text-lg">
              {scannedVendor.amount} {formatAssetCode(scannedVendor.assetCode)}
            </StyledText>
          </StyledView>
          <StyledView className="flex justify-center">
            <Button backgroundColor="red" textColor="white" onPress={handleProceedToPayment}>
              Proceed to payment
            </Button>
          </StyledView>
        </StyledView>
      ) : (
        <StyledText className="text-red text-lg mt-4 font-bold">{error}</StyledText>
      )}
    </StyledView>
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
