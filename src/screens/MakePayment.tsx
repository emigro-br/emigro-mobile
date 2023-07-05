import { styled } from 'nativewind';
import React, { useState } from 'react';
import { Button, Text, View } from 'react-native';

import Header from '@components/Header';
import QRCodeScanner from '@components/QRCodeScanner';

const StyledText = styled(Text);
const StyledView = styled(View);

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
      <Header children />
      <StyledView>
        <StyledText>Made a payment</StyledText>
        <Button title="Scan QR" onPress={handleScanPress} />
      </StyledView>
    </>
  );
};

export default MakePayment;
