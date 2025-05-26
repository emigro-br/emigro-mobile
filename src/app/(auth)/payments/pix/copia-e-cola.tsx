import { useEffect, useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import { Stack, useRouter } from 'expo-router';
import { hasError, parsePix } from 'pix-utils';

import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
} from '@/components/ui/form-control';
import { Heading } from '@/components/ui/heading';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import { VStack } from '@/components/ui/vstack';
import { InvalidPixError, paymentStore } from '@/stores/PaymentStore';

export const PastePixCode = () => {
  const router = useRouter();
  const [brCode, setBrCode] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    handlePaste();
  }, []);

  const handlePaste = async () => {
    try {
      const text = (await Clipboard.getStringAsync()).trim();
      console.log('[PastePixCode][handlePaste] Retrieved from clipboard:', text);

      if (text) {
        const pix = parsePix(text);
        console.log('[PastePixCode][handlePaste] Parsed Pix:', pix);
        if (!hasError(pix)) {
          setBrCode(text);
        } else {
          console.warn('[PastePixCode][handlePaste] Invalid Pix structure');
        }
      }
    } catch (err) {
      console.error('[PastePixCode][handlePaste] Error reading clipboard:', err);
    }
  };

  const handleContinue = async () => {
    setIsChecking(true);
    console.log('[PastePixCode][handleContinue] Checking Pix code:', brCode);

    try {
      if (!brCode || typeof brCode !== 'string') {
        throw new Error('Pix code is invalid or empty');
      }

      const payment = await paymentStore.preview(brCode);
      console.log('[PastePixCode][handleContinue] Payment preview result:', payment);

      if (!payment || typeof payment !== 'object' || !payment.assetCode) {
        console.error(
          '[PastePixCode][handleContinue] Incomplete payment object returned:',
          payment
        );
        throw new Error('Payment details are incomplete or invalid');
      }

      paymentStore.setScannedPayment(payment);
      console.log('[PastePixCode][handleContinue] Scanned payment set');
      setError('');
      router.push('/payments/confirm');
    } catch (err) {
      if (err instanceof InvalidPixError) {
        console.warn('[PastePixCode][handleContinue] InvalidPixError:', err.message);
        setError('Invalid Pix code');
      } else {
        console.error('[PastePixCode][handleContinue] Unexpected error:', err);
        setError('Unable to verify the Pix code. Please try again.');
      }
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Pay with Pix' }} />
      <Box className="flex-1 bg-[#0a0a0a]">
        <VStack space="lg" className="p-4">
          <Heading size="xl" className="text-center text-white">
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
                height: 200,
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
                  flex: 1,
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
            onPress={handleContinue}
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
