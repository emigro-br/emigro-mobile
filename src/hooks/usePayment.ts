import { useEffect, useState } from 'react';

import { ITransactionRequest } from '@/types/ITransactionRequest';
import { IVendor } from '@/types/IVendor';

import { getUserBalance, handleQuote, sendTransaction } from '@services/emigro';

export enum TransactionStep {
  NONE = 'none',
  CONFIRM_PAYMENT = 'confirm_payment',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  ERROR = 'error',
}

interface TransactionValue {
  message: string;
}

const usePayment = (
  paymentAmount: string,
  scannedVendor: IVendor,
  sourceAssetCode: string,
  destinationAssetCode: string,
) => {
  const [transactionValue, setTransactionValue] = useState<number | TransactionValue>(0);
  const [maxAmountToSend, setMaxAmountToSend] = useState<string>('0');
  const [step, setStep] = useState<TransactionStep>(TransactionStep.NONE);

  const [transactionError, setTransactionError] = useState<Error | unknown>(null);

  useEffect(() => {
    const handlePayment = async () => {
      try {
        if (paymentAmount) {
          const from = destinationAssetCode;
          const to = sourceAssetCode;
          const transactionQuote = { from, to, amount: paymentAmount };
          const calculatedTransactionValue = await handleQuote(transactionQuote);
          if (calculatedTransactionValue) {
            setTransactionValue(Number(calculatedTransactionValue));
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    const fetchUserBalance = async () => {
      try {
        const userBalances = await getUserBalance();
        const sourceAssetBalance = userBalances.find((balance) => balance.assetCode === sourceAssetCode);

        if (sourceAssetBalance) {
          setMaxAmountToSend(sourceAssetBalance.balance);
        }
      } catch (error) {
        console.error(error);
      }
    };

    handlePayment();
    fetchUserBalance();
  }, [paymentAmount, sourceAssetCode]);

  const handleConfirmPayment = async () => {
    try {
      setStep(TransactionStep.PROCESSING);
      const transactionRequest: ITransactionRequest = {
        maxAmountToSend,
        destinationAmount: paymentAmount,
        destination: scannedVendor.publicKey,
        sourceAssetCode,
        destinationAssetCode,
      };
      const paymentResponse = await sendTransaction(transactionRequest);
      setStep(TransactionStep.SUCCESS);
      return paymentResponse;
    } catch (error) {
      console.error('[handleConfirmPayment]', error);
      setStep(TransactionStep.ERROR);
      setTransactionError(error);
    }
  };

  return {
    transactionValue,
    transactionError,
    handleConfirmPayment,
    step,
    setStep,
  };
};

export default usePayment;
