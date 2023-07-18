import { useEffect, useState } from 'react';

import { handleQuote, sendTransaction } from '@/services/emigro';

const usePayment = (paymentAmount: any, scannedData: any) => {
  const [transactionValue, setTransactionValue] = useState('');
  const [isTransactionLoading, setTransactionLoading] = useState(false);
  const [isTransactionCompletedModalVisible, setTransactionCompletedModalVisible] = useState(false);

  useEffect(() => {
    if (!paymentAmount) {
      return;
    }
    const handlePayment = async () => {
      try {
        const from = `USDC:${process.env.FROM_PUBLIC_KEY}`;
        const to = `BRL:${process.env.TO_PUBLIC_KEY}`;
        const quoteResponse = await handleQuote(from, to, paymentAmount);

        setTransactionValue(quoteResponse > 0 ? quoteResponse.toString() : '0');
      } catch (error) {
        console.error(error);
      }
    };
    handlePayment();
  }, [paymentAmount]);

  const handleConfirmPayment = async () => {
    try {
      setTransactionLoading(true);
      const paymentResponse = await sendTransaction(transactionValue.toString(), scannedData.publicKey);
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
