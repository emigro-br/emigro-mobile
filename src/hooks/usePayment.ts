import { useEffect, useState } from 'react';

import { handleQuote, sendTransaction } from '@/services/emigro';
import { IVendor } from '@/types/IVendor';

import { AssetCode } from '@constants/assetCode';

interface TransactionValue {
  message: string;
}

const usePayment = (paymentAmount: string, scannedVendor: IVendor) => {
  const [transactionValue, setTransactionValue] = useState<number | TransactionValue>(0);
  const [isTransactionLoading, setTransactionLoading] = useState(false);
  const [isTransactionCompletedModalVisible, setTransactionCompletedModalVisible] = useState(false);

  useEffect(() => {
    if (!paymentAmount) {
      return;
    }
    const handlePayment = async () => {
      try {
        const from = `${AssetCode.USDC}:${process.env.FROM_PUBLIC_KEY}`;
        const to = `${AssetCode.BRL}:${process.env.TO_PUBLIC_KEY}`;
        const quoteResponse = await handleQuote(from, to, paymentAmount);
        setTransactionValue(quoteResponse);
      } catch (error) {
        console.error(error);
      }
    };
    handlePayment();
  }, [paymentAmount]);

  const handleConfirmPayment = async () => {
    try {
      setTransactionLoading(true);
      const paymentResponse = await sendTransaction(transactionValue.toString(), scannedVendor.publicKey);
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
