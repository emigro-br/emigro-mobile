import { styled } from 'nativewind';
import React, { useState } from 'react';
import { Image, View } from 'react-native';

import qrImage from '../assets/images/qr-code.png';

import Button from '@components/Button';
import Header from '@components/Header';
import QRCodeScanner from '@components/QRCodeScanner';

const StyledView = styled(View);
const StyledImage = styled(Image);

const MakePayment = () => {
  const [showScanner, setShowScanner] = useState(false);

  const handleScanPress = () => {
    setShowScanner(true);
  };

  const handleCancelPress = () => {
    setShowScanner(false);
  };

  if (showScanner) {
    return (
      <>
        <QRCodeScanner onCancel={handleCancelPress} />
      </>
    );
  }

  return (
    <>
      <Header children />
      <StyledView className="flex items-center h-[80vh] justify-around m-2">
        <StyledImage source={qrImage} className="h-[200px] w-[200px] mt-10" />
        <StyledView className="flex w-full px-4">
          <Button bg="blue" textColor="white" onPress={handleScanPress}>
            Make a Payment
          </Button>
        </StyledView>
      </StyledView>
    </>
  );
};

export default MakePayment;
