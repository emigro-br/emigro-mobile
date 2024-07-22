import { VStack } from "@/components/ui/vstack";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { Heading } from "@/components/ui/heading";
import { FormControl, FormControlError, FormControlErrorText } from "@/components/ui/form-control";
import { Button, ButtonText } from "@/components/ui/button";
import { Box } from "@/components/ui/box";
import { useEffect, useState } from 'react';

import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { hasError, parsePix } from 'pix-utils';

import { paymentStore } from '@/stores/PaymentStore';

export const PastePixCode = () => {
  const router = useRouter();
  const [brCode, setBrCode] = useState<string>('');
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    handlePaste();
  }, []);

  const handlePaste = async () => {
    const text = await Clipboard.getStringAsync();
    if (text) {
      const pix = parsePix(text.trim());
      if (!hasError(pix)) {
        setBrCode(text);
      }
    }
  };

  const handleContinue = async () => {
    setIsChecking(true);
    try {
      const payment = await paymentStore.preview(brCode);
      paymentStore.setScannedPayment(payment);
      router.push('/payments/confirm');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        console.warn('Error previewing payment:', error);
        setError('An error occurred while checking the payment');
      }
    }
    setIsChecking(false);
  };

  return (
    <Box className="flex-1 bg-white">
      <VStack space="lg" className="p-4">
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

export default PastePixCode;
