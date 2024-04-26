import { api } from './api';
import { PaymentResponse, Transaction, TransactionRequest } from './types';

type BrcodePaymentRequest = {
  brcode: string;
  sourceAsset: string;
  amount: number;
  taxId: string;
  description: string;
};

export type DictKey = {
  pixKey: string;
  taxId: string;
  bankName: string;
};

export type PaymentPreview = {
  type: string;
  payment: Payment;
};

export type Payment = {
  pixKey: string;
  amount: number;
  bankName: string;
  name: string;
  taxId: string;
  txId: string;
};

export const getTransactions = async (): Promise<Transaction[]> => {
  const res = await api().get('/transaction/all');
  const { transactions } = res.data;
  return transactions;
};

export const sendTransaction = async (data: TransactionRequest): Promise<PaymentResponse> => {
  const timeout = 30000; // some transactions may take longer
  const res = await api({ timeout }).post('/transaction', data);
  return res.data;
};

// export const dictKey = async (key: string): Promise<DictKey> => {
//   const res = await api().get(`/transaction/dict-key/${key}`);
//   return res.data;
// };

export const brcodePaymentPreview = async (brcode: string): Promise<PaymentPreview> => {
  const res = await api().post('/transaction/payment-preview', {
    brcode,
  });
  return res.data;
};

export const brcodePayment = async (data: BrcodePaymentRequest) => {
  const res = await api({ timeout: 30000 }).post('/transaction/brcode-payment', data);
  return res.data;
};
