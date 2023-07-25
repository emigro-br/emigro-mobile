import { styled } from 'nativewind';
import React, { useState } from 'react';
import { Image, View } from 'react-native';

import qrImage from '../assets/images/qr-code.png';

import Button from '@components/Button';
import QRCodeScanner from '@components/QRCodeScanner';

const StyledView = styled(View);
const StyledImage = styled(Image);

const MakePayment = () => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleScanPress = () => {
    setIsScannerOpen(true);
  };

  const handleCancelPress = () => {
    setIsScannerOpen(false);
  };

  if (isScannerOpen) {
    return (
      <>
        <QRCodeScanner onCancel={handleCancelPress} />
      </>
    );
  }

  return (
    <>
      <StyledView className="flex items-center h-[100vh] justify-around p-2 bg-white">
        <StyledImage source={qrImage} className="h-[200px] w-[200px] mt-10" />
        <StyledView className="flex w-full px-4 mb-20">
          <Button backgroundColor="red" textColor="white" onPress={handleScanPress}>
            Make a Payment
          </Button>
        </StyledView>
      </StyledView>
    </>
  );
};

export default MakePayment;
