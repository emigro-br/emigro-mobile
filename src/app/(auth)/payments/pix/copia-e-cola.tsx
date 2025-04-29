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
    if (text) {
      const pix = parsePix(text);
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
      setError(''); // Reset error
    } catch (error) {
      if (error instanceof InvalidPixError) {
        setError('Invalid Pix code');
      } else {
        console.warn('Error previewing payment:', error);
        setError('An error occurred while checking this payment');
      }
    }
    setIsChecking(false);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Pay with Pix' }} />
      <Box className="flex-1 bg-[#0a0a0a]">
        <VStack space="lg" className="p-4">
          <Heading size="xl" className="text-center" style={{ color: '#ffffff' }}>
            Insert your Pix Copia & Cola code
          </Heading>

          <FormControl isInvalid={!!error}>
            <Textarea
              style={{
                borderColor: '#e5e7eb',
                borderWidth: 1,
                borderRadius: 12,
                backgroundColor: '#0a0a0a',
                marginTop: 20,
                height: 200, // <-- FIXED: Big height!
                paddingHorizontal: 16,
                paddingVertical: 12,
              }}
            >
              <TextareaInput
                multiline
                value={brCode}
                onChange={() => setError('')}
                onChangeText={(text) => setBrCode(text.trim())}
                placeholder="Paste your Pix code here"
                placeholderTextColor="#a1a1aa"
                style={{
                  fontSize: 18,
                  color: '#ffffff',
                  textAlignVertical: 'top',
                  flex: 1, // grow to fit parent
                }}
                testID="text-area"
              />
            </Textarea>

            <FormControlError>
              <FormControlErrorText style={{ color: '#f87171' }}>{error}</FormControlErrorText>
            </FormControlError>
          </FormControl>

          <Button
            className="mt-6 rounded-full"
            style={{ height: 56 }}
            onPress={() => handleContinue()}
            disabled={!brCode || isChecking}
          >
            <ButtonText className="text-lg text-white">
              {isChecking ? 'Please wait...' : 'Continue'}
            </ButtonText>
          </Button>
        </VStack>
      </Box>
    </>
  );
};

export default PastePixCode;
