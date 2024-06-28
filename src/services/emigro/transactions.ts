import { api } from './api';
import {
  BrcodePaymentRequest,
  BrcodePaymentResponse,
  CreatePaymentTransaction,
  CreateSwapTransaction,
  CreateTransferTransaction,
  PixPaymentPreview,
  Transaction,
} from './types';

export const getTransaction = async (transactionId: string): Promise<Transaction> => {
  const res = await api().get(`/transaction/${transactionId}`);
  return res.data;
};

export const swap = async (data: CreateSwapTransaction): Promise<Transaction> => {
  const res = await api().post('/transaction/swap', data);
  return res.data;
};

export const transfer = async (data: CreateTransferTransaction): Promise<Transaction> => {
  const res = await api().post('/transaction/transfer', data);
  return res.data;
};

export const payment = async (data: CreatePaymentTransaction): Promise<Transaction> => {
  const res = await api().post('/transaction/payment', data);
  return res.data;
};

// export const dictKey = async (key: string): Promise<DictKey> => {
//   const res = await api().get(`/transaction/dict-key/${key}`);
//   return res.data;
// };

// PIX
export const brcodePaymentPreview = async (brcode: string): Promise<PixPaymentPreview> => {
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
