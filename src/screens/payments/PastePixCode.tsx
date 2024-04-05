import { useEffect, useState } from 'react';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  Box,
  Button,
  ButtonText,
  FormControl,
  FormControlError,
  FormControlErrorText,
  Heading,
  Textarea,
  TextareaInput,
  VStack,
} from '@gluestack-ui/themed';
import * as Clipboard from 'expo-clipboard';
import { PixElementType, hasError, parsePix } from 'pix-utils';

import { PixPayment } from '@/types/PixPayment';
import { CryptoAsset } from '@/types/assets';

import { PaymentStackParamList } from '@navigation/PaymentsStack';

import { paymentStore } from '@stores/PaymentStore';

type Props = {
  navigation: NativeStackNavigationProp<PaymentStackParamList, 'PastePixCode'>;
};

export const PastePixCode = ({ navigation }: Props) => {
  const [brCode, setBrCode] = useState<string>('');
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    handlePaste();
  }, []);

  const handlePaste = async () => {
    const text = await Clipboard.getStringAsync();
    if (text) {
      const pix = parsePix(text);
      if (!hasError(pix)) {
        setBrCode(text);
      }
    }
  };

  const handleContinue = async () => {
    setIsChecking(true);
    const pix = parsePix(brCode);
    if (hasError(pix)) {
      setError('Invalid Pix code');
    } else if (pix.type === PixElementType.STATIC) {
      let pixPayment = {
        ...pix,
        brCode,
        assetCode: CryptoAsset.XLM,
        taxId: '', // updated by payment preview
      } as PixPayment;

      try {
        pixPayment = await paymentStore.previewPixPayment(pixPayment);
        paymentStore.setScannedPayment(pixPayment);
        navigation.push('ConfirmPayment');
      } catch (error) {
        console.warn('Error previewing payment:', error);
        setError('Could not preview payment. Please try again.');
      }
    } else {
      setError('Dynamic Pix code is not supported yet');
    }
    setIsChecking(false);
  };

  return (
    <Box flex={1} bg="$white">
      <VStack p="$4" space="lg">
        <Heading>Insert your Pix Copia & Cola code</Heading>
        <FormControl isInvalid={!!error}>
          <Textarea>
            <TextareaInput
              value={brCode}
              onChange={() => setError('')}
              onChangeText={(text) => setBrCode(text)}
              placeholder="Paste your Pix code here"
              testID="text-area"
            />
          </Textarea>
          <FormControlError>
            <FormControlErrorText>{error}</FormControlErrorText>
          </FormControlError>
        </FormControl>
        <Button onPress={() => handleContinue()} isDisabled={!brCode || isChecking}>
          <ButtonText>{isChecking ? 'Please wait...' : 'Continue'}</ButtonText>
        </Button>
      </VStack>
    </Box>
  );
};
