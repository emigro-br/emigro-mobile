import { useState } from 'react';

import { useToast } from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';

import { LoadingScreen } from '@/components/Loading';
import { Toast } from '@/components/Toast';
import { PinScreen } from '@/components/screens/PinScreen';
import { paymentStore as bloc } from '@/stores/PaymentStore';
import { securityStore } from '@/stores/SecurityStore';

export const ConfirmPin = () => {
  const toast = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handleConfirmTransaction = async () => {
    setIsProcessing(true);
    const defaultError = 'Failed on execute transfer. Please try again.';
    try {
      // Send the transaction
      const result = await bloc.pay();
      if (result.status === 'paid' || result.transactionHash) {
        router.replace('./success');
      } else {
        throw new Error(defaultError);
      }
    } catch (error) {
      console.warn('Error on pay transfer', error);
      let message = defaultError;
      if (error instanceof Error) {
        message = error.message;
      }
      router.replace({
        pathname: './error',
        params: { error: message },
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return <LoadingScreen />; // TODO: improve the processing screen
  }

  return (
    <PinScreen
      tagline="Enter your PIN code"
      btnLabel="Confirm"
      autoSubmit
      verifyPin={async (pin) => await securityStore.verifyPin(pin)}
      onPinSuccess={() => {
        handleConfirmTransaction();
      }}
      onPinFail={(error) => {
        toast.show({
          render: ({ id }) => <Toast id={id} title="PIN failed" description={error.message} action="error" />,
        });
        router.dismiss();
      }}
    />
  );
};

export default ConfirmPin;
