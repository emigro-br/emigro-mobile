import { Ionicons } from '@expo/vector-icons';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { styled } from 'nativewind';
import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type QRCodeScannerProps = {
  onCancel: () => void;
};

const StyledView = styled(View);

const StyledText = styled(Text);

const StyledTouchableOpacity = styled(TouchableOpacity);

const StyledButton = styled(Button);

const QRCodeScanner = ({ onCancel }: QRCodeScannerProps) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanned, setIsScanned] = useState(false);
  const [text, setText] = useState({ name: '', vendorId: '', address: '', publicKey: '' });

  const askForCameraPermission = () => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  };

  useEffect(() => {
    askForCameraPermission();
  }, []);

  const handleBarCodeScanned = (vendor: any) => {
    setIsScanned(true);
    try {
      const scannedInfo = JSON.parse(vendor);
      setText(scannedInfo);
    } catch (error) {
      console.log(error, 'Invalid QR code');
    }
  };

  if (hasPermission === null) {
    return (
      <StyledView className="flex items-center justify-center">
        <StyledText className="text-lg">Requesting for camera permission</StyledText>
      </StyledView>
    );
  } else if (!hasPermission) {
    return (
      <StyledView className="flex items-center justify-center">
        <StyledText className="text-lg m-4">No access to camera</StyledText>
        <StyledButton className="mt-4" title={'Allow Camera'} onPress={() => askForCameraPermission()} />
      </StyledView>
    );
  }

  return (
    <StyledView className="flex items-center justify-center mt-10">
      <StyledTouchableOpacity className="absolute top-6 right-6 z-10" onPress={onCancel}>
        <Ionicons name="close" size={32} color="white" />
      </StyledTouchableOpacity>
      <StyledView className="items-center justify-center h-96 w-96 rounded-3xl bg-tomato">
        <BarCodeScanner
          onBarCodeScanned={isScanned ? undefined : handleBarCodeScanned}
          style={[StyleSheet.absoluteFill, styles.container]}
          barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
        >
          <StyledView style={styles.cameraContainer}>
            <StyledView style={styles.rectangleContainer}>
              <StyledView style={styles.rectangle} />
            </StyledView>
          </StyledView>
        </BarCodeScanner>
      </StyledView>
      <StyledText className="text-lg">Vendor: {text.name}</StyledText>
      <StyledText className="text-lg">Vendor Id: {text.vendorId}</StyledText>
      <StyledText className="text-lg">Address: {text.address}</StyledText>
      <StyledText className="text-lg">Public Key: {text.publicKey}</StyledText>
      {isScanned && <StyledButton title={'Tap to Scan Again'} onPress={() => setIsScanned(false)} color="tomato" />}
    </StyledView>
  );
};

export default QRCodeScanner;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  cameraContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rectangleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  rectangle: {
    height: 250,
    width: 250,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: 'transparent',
    borderRadius: 15,
  },
});
