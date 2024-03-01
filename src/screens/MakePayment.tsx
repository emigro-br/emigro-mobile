import React, { useState } from 'react';
import { QrCodeIcon } from 'react-native-heroicons/solid';

import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

import { Box, Button, ButtonIcon, ButtonText, Center, Image, VStack } from '@gluestack-ui/themed';

import qrImage from '@assets/images/qr-code.png';

import QRCodeScanner from '@components/QRCodeScanner';

import { RootStackParamList } from '@navigation/index';

type MakePaymentProps = BottomTabScreenProps<RootStackParamList, 'MakePayment'>;

const MakePayment: React.FC<MakePaymentProps> = ({ navigation }) => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleScanPress = () => {
    setIsScannerOpen(true);
  };

  const handleCancelPress = () => {
    setIsScannerOpen(false);
  };

  if (isScannerOpen) {
    return (
      <QRCodeScanner onCancel={handleCancelPress} onProceedToPayment={() => navigation.navigate('ConfirmPayment')} />
    );
  }

  return (
    <Box flex={1} bg="$white">
      <VStack p="$4" space="lg">
        <Center my="$8">
          <Image source={qrImage} size="2xl" alt="QR Code" />
        </Center>
        <Button onPress={handleScanPress}>
          <ButtonIcon as={QrCodeIcon} mr="$2" />
          <ButtonText>Scan a Payment</ButtonText>
        </Button>
      </VStack>
    </Box>
  );
};

export default MakePayment;
