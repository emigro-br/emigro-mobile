import { api } from './api';
import {
  BrcodePaymentRequest,
  BrcodePaymentResponse,
  PaymentPreview,
  PaymentResponse,
  Transaction,
  TransactionRequest,
} from './types';

export const getTransactions = async (): Promise<Transaction[]> => {
  const res = await api().get('/transaction/all');
  const { transactions } = res.data;
  return transactions;
};

export const sendTransaction = async (data: TransactionRequest): Promise<PaymentResponse> => {
  const timeout = 30 * 1000; // some transactions may take longer
  const res = await api({ timeout }).post('/transaction', data);
  return res.data;
};

// export const dictKey = async (key: string): Promise<DictKey> => {
//   const res = await api().get(`/transaction/dict-key/${key}`);
//   return res.data;
// };

// PIX
export const brcodePaymentPreview = async (brcode: string): Promise<PaymentPreview> => {
  const res = await api().post('/pix/payment-preview', {
    brcode,
  });
  return res.data;
};

export const createBrcodePayment = async (data: BrcodePaymentRequest): Promise<BrcodePaymentResponse> => {
  const timeout = 15 * 1000; // some transactions may take longer
  const res = await api({ timeout }).post('/pix/brcode-payment', data);
  return res.data;
};

export const getBrcodePayment = async (transactionId: string): Promise<BrcodePaymentResponse> => {
  const res = await api().get(`/pix/brcode-payment/${transactionId}`);
  return res.data;
};
