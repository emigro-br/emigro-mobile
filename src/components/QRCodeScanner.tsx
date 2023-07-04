import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { styled } from 'nativewind';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Button from './Button';

type QRCodeScannerProps = {
  onCancel: () => void;
};

const StyledView = styled(View);

const StyledText = styled(Text);

const StyledTouchableOpacity = styled(TouchableOpacity);

const QRCodeScanner = ({ onCancel }: QRCodeScannerProps) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [text, setText] = useState({ name: '', vendorId: '', address: '', publicKey: '' });
  const [error, setError] = useState('');

  const navigation = useNavigation();

  const askForCameraPermission = () => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  };

  useEffect(() => {
    askForCameraPermission();
  }, []);

  const handleBarCodeScanned = ({ data }: any) => {
    setScanned(true);
    try {
      const qrObject = JSON.parse(data);
      setText(qrObject);
    } catch (error) {
      !text.name;
      setError('Invalid QR code, try another one');
      setScanned(false);
    }
  };

  if (hasPermission === false) {
    return (
      <StyledView className="flex items-center justify-center h-full">
        <StyledText className="text-lg m-4">No access to camera</StyledText>
        <Button onPress={() => askForCameraPermission()} bg="red" textColor="white">
          Allow camera
        </Button>
      </StyledView>
    );
  }

  return (
    <StyledView className="flex items-center justify-center h-full">
      <StyledView className="items-center justify-center h-96 w-full rounded-3xl">
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
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
      {scanned && text.name ? (
        <StyledView className="flex flex-col p-4 mt-4 w-full shadow-lg shadow-black">
          <StyledText className="text-xl mb-4 font-bold">Confirm the information below:</StyledText>
          <StyledView className="flex flex-row mb-4">
            <StyledText className="text-lg font-bold">Vendor: </StyledText>
            <StyledText className="text-lg">{text.name}</StyledText>
          </StyledView>
          <StyledView className="flex flex-row mb-4">
            <StyledText className="text-lg font-bold">Address: </StyledText>
            <StyledText className="text-lg">{text.address}</StyledText>
          </StyledView>
          <StyledView className="flex justify-center">
            <Button
              bg="red"
              textColor="white"
              onPress={() => navigation.navigate('ConfirmPayment', { scannedData: text })}
            >
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
