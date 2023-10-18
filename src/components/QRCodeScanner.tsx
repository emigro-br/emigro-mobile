import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { BarCodeEvent, BarCodeScanner } from 'expo-barcode-scanner';
import { styled } from 'nativewind';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Button from './Button';

import { INVALID_QR_CODE } from '@/constants/errorMessages';
import { GRANTED_STATUS } from '@/constants/statusMessages';
import { useVendor } from '@/contexts/VendorContext';
import { RootStackParamList } from '@/screens/ConfirmPayment';

type QRCodeScannerProps = {
  onCancel: () => void;
};

const StyledView = styled(View);

const StyledText = styled(Text);

const StyledTouchableOpacity = styled(TouchableOpacity);

const QRCodeScanner = ({ onCancel }: QRCodeScannerProps) => {
  const { scannedVendor, setScannedVendor } = useVendor();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanned, setIsScanned] = useState(false);
  const [error, setError] = useState('');

  const navigation: NavigationProp<RootStackParamList> = useNavigation();

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === GRANTED_STATUS);
    };
    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = (vendor: BarCodeEvent) => {
    setIsScanned(true);
    try {
      const qrObject = JSON.parse(vendor.data);
      setScannedVendor(qrObject);
    } catch (error) {
      setError(INVALID_QR_CODE);
      setIsScanned(false);
      console.error(error, INVALID_QR_CODE);
    }
  };

  const handleProceedToPayment = () => {
    navigation.navigate('ConfirmPayment' as never);
    onCancel();
  };

  if (!hasPermission) {
    return (
      <StyledView className="flex items-center justify-center h-full">
        <StyledText className="text-lg m-4">No access to camera</StyledText>
      </StyledView>
    );
  }

  return (
    <StyledView className="flex items-center justify-center h-full">
      <StyledView className="items-center justify-center h-60 w-full rounded-3xl">
        <BarCodeScanner
          onBarCodeScanned={isScanned ? undefined : handleBarCodeScanned}
          style={[StyleSheet.absoluteFill, styles.container]}
          barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
        >
          <StyledView style={styles.rectangleContainer}>
            <StyledTouchableOpacity className="absolute right-0 top-8 mr-8" onPress={onCancel}>
              <Ionicons name="close" size={32} color="white" />
            </StyledTouchableOpacity>
            <StyledView style={styles.rectangle} />
          </StyledView>
        </BarCodeScanner>
      </StyledView>
      {isScanned && scannedVendor?.name ? (
        <StyledView className="flex flex-col p-4 mt-4 w-full shadow-lg shadow-black">
          <StyledText className="text-xl mb-4 font-bold">Confirm the information below:</StyledText>
          <StyledView className="flex flex-row mb-4">
            <StyledText className="text-lg font-bold">Vendor: </StyledText>
            <StyledText className="text-lg">{scannedVendor.name}</StyledText>
          </StyledView>
          <StyledView className="flex flex-row mb-4">
            <StyledText className="text-lg font-bold">Address: </StyledText>
            <StyledText className="text-lg">{scannedVendor.address}</StyledText>
          </StyledView>
          <StyledView className="flex flex-row mb-4">
            <StyledText className="text-lg font-bold">Amount: </StyledText>
            <StyledText className="text-lg">{scannedVendor.amount}</StyledText>
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
    height: 250,
    width: 215,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: 'transparent',
    borderRadius: 15,
  },
});

export default QRCodeScanner;
