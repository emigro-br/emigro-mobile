import React, { useState } from 'react';
import { Image, View } from 'react-native';

import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { styled } from 'nativewind';

import Button from '@components/Button';
import QRCodeScanner from '@components/QRCodeScanner';

import { RootStackParamList } from '@navigation/index';

import qrImage from '../assets/images/qr-code.png';

const StyledView = styled(View);
const StyledImage = styled(Image);

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
    <StyledView className="flex items-center h-full  bg-white">
      <StyledImage source={qrImage} className="h-[200px] w-[200px] my-16" />
      <StyledView className="flex w-full px-4">
        <Button backgroundColor="red" textColor="white" onPress={handleScanPress}>
          Scan a Payment
        </Button>
      </StyledView>
    </StyledView>
  );
};

export default MakePayment;
