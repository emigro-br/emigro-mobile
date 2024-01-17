import { styled } from 'nativewind';
import React, { useState } from 'react';
import { Image, View } from 'react-native';

import qrImage from '../assets/images/qr-code.png';

import Button from '@components/Button';
import QRCodeScanner from '@components/QRCodeScanner';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/index';

const StyledView = styled(View);
const StyledImage = styled(Image);

type MakePaymentProps = NativeStackScreenProps<RootStackParamList, 'MakePayment'>;

const MakePayment: React.FunctionComponent<MakePaymentProps> = ({navigation}) => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleScanPress = () => {
    setIsScannerOpen(true);
  };

  const handleCancelPress = () => {
    setIsScannerOpen(false);
  };

  if (isScannerOpen) {
    return (
        <QRCodeScanner 
          onCancel={handleCancelPress} 
          onProceedToPayment={() => navigation.push('ConfirmPayment')}
        />
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
