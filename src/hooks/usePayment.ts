import { useEffect, useState } from 'react';

import { getUserBalance, handleQuote, sendTransaction } from '@/services/emigro';
import { ITransactionRequest } from '@/types/ITransactionRequest';
import { IVendor } from '@/types/IVendor';

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

  useEffect(() => {
    const handlePayment = async () => {
      try {
        if (paymentAmount) {
          const from = destinationAssetCode;
          const to = sourceAssetCode;
          const transactionQuote = { from, to, amount: paymentAmount };
          const calculatedTransactionValue = await handleQuote(transactionQuote);
          setTransactionValue(Number(calculatedTransactionValue));
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
      setIsTransactionLoading(false);
      setIsTransactionCompletedModalVisible(true);
      return paymentResponse;
    } catch (error) {
      console.error(error);
      setIsTransactionLoading(false);
    }
  };

  return {
    transactionValue,
    isTransactionLoading,
    isTransactionCompletedModalVisible,
    setIsTransactionCompletedModalVisible,
    handleConfirmPayment,
  };
};

export default usePayment;
