import { useEffect, useState } from 'react';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Box, Button, ButtonText, Heading, Textarea, TextareaInput, VStack } from '@gluestack-ui/themed';
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

  useEffect(() => {
    handlePaste();
  }, []);

  const handlePaste = async () => {
    const text = await Clipboard.getStringAsync();
    const pix = parsePix(text);
    if (!hasError(pix)) {
      setBrCode(text);
    }
  };

  const handleContinue = () => {
    const pix = parsePix(brCode);
    if (!hasError(pix) && pix.type === PixElementType.STATIC) {
      const pixPayment = {
        ...pix,
        brCode,
        assetCode: CryptoAsset.BRL,
      } as PixPayment;
      paymentStore.setScannedPayment(pixPayment);
      navigation.push('ConfirmPayment');
    }
  };

  return (
    <Box flex={1} bg="$white">
      <VStack p="$4" space="lg">
        <Heading>Insert your Pix Copia & Cola code</Heading>
        <Textarea>
          <TextareaInput value={brCode} onChangeText={setBrCode} placeholder="Paste your Pix code here" />
        </Textarea>
        <Button onPress={() => handleContinue()} isDisabled={!brCode}>
          <ButtonText>Continue</ButtonText>
        </Button>
      </VStack>
    </Box>
  );
};
