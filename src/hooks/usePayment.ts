import { useEffect, useState } from 'react';

import { getUserBalance, handleQuote, sendTransaction } from '@/services/emigro';
import { ITransactionRequest } from '@/types/ITransactionRequest';
import { IVendor } from '@/types/IVendor';

import { AssetCode } from '@constants/assetCode';

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
  const [isTransactionLoading, setTransactionLoading] = useState(false);
  const [isTransactionCompletedModalVisible, setTransactionCompletedModalVisible] = useState(false);

  useEffect(() => {
    const handlePayment = async () => {
      try {
        if (paymentAmount) {
          const from = `${AssetCode.USDC}:${process.env.FROM_PUBLIC_KEY}`;
          const to = `${AssetCode.BRL}:${process.env.TO_PUBLIC_KEY}`;
          const transactionQuote = { from, to, amount: paymentAmount };
          const calculatedTransactionValue = await handleQuote(transactionQuote);
          setTransactionValue(calculatedTransactionValue);
        }
      } catch (error) {
        console.error(error);
      }
    };

    handlePayment();
  }, [paymentAmount]);

  const handleConfirmPayment = async () => {
    try {
      setTransactionLoading(true);
      const transactionRequest: ITransactionRequest = {
        maxAmountToSend: '10000',
        destinationAmount: transactionValue.toString(),
        destination: scannedVendor.publicKey,
        sourceAssetCode: sourceAssetCode,
        destinationAssetCode: destinationAssetCode,
      };
      const paymentResponse = await sendTransaction(transactionRequest);
      setTransactionLoading(false);
      setTransactionCompletedModalVisible(true);
      return paymentResponse;
    } catch (error) {
      console.error(error);
      setTransactionLoading(false);
    }
  };

  return {
    transactionValue,
    isTransactionLoading,
    isTransactionCompletedModalVisible,
    setTransactionCompletedModalVisible,
    handleConfirmPayment,
  };
};

export default usePayment;
