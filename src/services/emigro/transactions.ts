import { api } from './api';
import { CreatePaymentTransaction, CreateSwapTransaction, CreateTransferTransaction, Transaction } from './types';

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
