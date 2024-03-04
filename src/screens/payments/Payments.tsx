import React, { useState } from 'react';
import { QrCodeIcon } from 'react-native-heroicons/solid';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Box, Button, ButtonIcon, ButtonText, Center, Image, VStack } from '@gluestack-ui/themed';

import qrImage from '@assets/images/qr-code.png';

import QRCodeScanner from '@components/QRCodeScanner';

import { PaymentStackParamList } from '@navigation/PaymentsStack';

type Props = {
  navigation: NativeStackNavigationProp<PaymentStackParamList, 'Payments'>;
};

const Payments: React.FC<Props> = ({ navigation }) => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleScanPress = () => {
    setIsScannerOpen(true);
  };

  const handleCancelPress = () => {
    setIsScannerOpen(false);
  };

  if (isScannerOpen) {
    return <QRCodeScanner onCancel={handleCancelPress} onProceedToPayment={() => navigation.push('ConfirmPayment')} />;
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

export default Payments;
