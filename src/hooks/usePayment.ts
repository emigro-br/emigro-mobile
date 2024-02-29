import { useEffect, useState } from 'react';

import { ITransactionRequest } from '@/types/ITransactionRequest';
import { IVendor } from '@/types/IVendor';

import { getUserBalance, handleQuote, sendTransaction } from '@services/emigro';

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
  const [isTransactionLoading, setIsTransactionLoading] = useState(false);
  const [isTransactionCompletedModalVisible, setIsTransactionCompletedModalVisible] = useState(false);
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
      setIsTransactionLoading(true);
      const transactionRequest: ITransactionRequest = {
        maxAmountToSend,
        destinationAmount: paymentAmount,
        destination: scannedVendor.publicKey,
        sourceAssetCode,
        destinationAssetCode,
      };
      const paymentResponse = await sendTransaction(transactionRequest);
      return paymentResponse;
    } catch (error) {
      setTransactionError(error);
      console.error('[handleConfirmPayment]', error);
    } finally {
      setIsTransactionLoading(false);
      setIsTransactionCompletedModalVisible(true);
    }
  };

  return {
    transactionValue,
    isTransactionLoading,
    isTransactionCompletedModalVisible,
    transactionError,
    setIsTransactionCompletedModalVisible,
    handleConfirmPayment,
  };
};

export default usePayment;
