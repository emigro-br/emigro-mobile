import { useEffect, useState } from 'react';

import * as Clipboard from 'expo-clipboard';
import { Stack, useRouter } from 'expo-router';
import { hasError, parsePix } from 'pix-utils';

import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { FormControl, FormControlError, FormControlErrorText } from '@/components/ui/form-control';
import { Heading } from '@/components/ui/heading';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import { VStack } from '@/components/ui/vstack';
import { InvalidPixError, paymentStore } from '@/stores/PaymentStore';
import { sessionStore } from '@/stores/SessionStore'; // Ensure sessionStore is imported

export const PastePixCode = () => {
  const router = useRouter();
  const [brCode, setBrCode] = useState<string>('');
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    handlePaste();
  }, []);

  const handlePaste = async () => {
    const text = (await Clipboard.getStringAsync()).trim();
    console.log('Clipboard text:', text); // Debug
    const pix = parsePix(text);
    console.log('Parsed Pix:', pix); // Debug
    if (!hasError(pix)) {
      setBrCode(text);
    } else {
      console.error('Pix parsing error:', pix);
    }
  };

  const handleContinue = async () => {
    setIsChecking(true);
    setError(''); // Reset errors

    try {
      // Ensure sessionStore token is valid
      const accessToken = sessionStore?.accessToken;
      if (!accessToken) {
        setError('Authentication token is missing. Please login again.');
        setIsChecking(false);
        return;
      }

      // Ensure the token is properly set in the paymentStore for use in API calls
      paymentStore.token = accessToken;

      console.log('Access Token handleContinue (PaymentStore):', paymentStore.token); // Debug
      console.debug('Authorization Token in preview (SessionStore):', accessToken);

      // Call the payment preview
      const payment = await paymentStore.preview(brCode);
      console.log('Payment preview response handleContinue:', payment); // Debug
      paymentStore.setScannedPayment(payment);
      //router.push('/payments/confirm');
      router.push('/pix/payment-preview');
    } catch (error) {
      console.error('Error previewing payment:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        setError('Unauthorized: Please check your access token or login again.');
      } else {
        setError('An error occurred while checking this payment.');
      }
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Pay with Pix' }} />
      <Box className="flex-1 bg-white">
        <VStack space="lg" className="p-4">
          <Heading>Insert your Pix Copia & Cola code</Heading>
          <FormControl isInvalid={!!error}>
            <Textarea>
              <TextareaInput
                value={brCode}
                onChange={() => setError('')}
                onChangeText={(text) => setBrCode(text.trim())}
                placeholder="Paste your Pix code here"
                testID="text-area"
              />
            </Textarea>
            <FormControlError>
              <FormControlErrorText>{error}</FormControlErrorText>
            </FormControlError>
          </FormControl>
          <Button size="lg" onPress={() => handleContinue()} disabled={!brCode || isChecking}>
            <ButtonText>{isChecking ? 'Please wait...' : 'Continue'}</ButtonText>
          </Button>
        </VStack>
      </Box>
    </>
  );
};

export default PastePixCode;
