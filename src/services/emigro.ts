import { IAuthSession } from '@/types/IAuthSession';
import { IBalance } from '@/types/IBalance';
import { IPaymentResponse } from '@/types/IPaymentResponse';
import { IQuoteRequest } from '@/types/IQuoteRequest';
import { ITransaction } from '@/types/ITransaction';
import { ITransactionRequest } from '@/types/ITransactionRequest';
import { IUserProfile } from '@/types/IUserProfile';

import { api } from './api';

export const getTransactions = async (): Promise<ITransaction[]> => {
  const res = await api().get('/transaction/all');
  const { transactions } = res.data;
  return transactions;
};

export const getUserBalance = async (): Promise<IBalance[]> => {
  const res = await api().get('/user');
  const { balances } = res.data;
  if (!balances) {
    throw new Error('No balances found');
  }
  // workaround for the backend not returning the assetCode for native
  for (const balance of balances) {
    if (balance.assetType === 'native') {
      balance.assetCode = 'XLM';
    }
  }
  return balances;
};

export const handleQuote = async (data: IQuoteRequest): Promise<number | null> => {
  const res = await api().post('/quote', data);
  const { quote } = res.data;
  return Number(quote);
};

export const sendTransaction = async (data: ITransactionRequest): Promise<IPaymentResponse> => {
  const timeout = 30000; // some transactions may take longer
  const res = await api({ timeout }).post('/transaction', data);
  return res.data;
};

export const getUserPublicKey = async (): Promise<string> => {
  const res = await api().get('/user');
  return res.data.publicKey;
};

export const getUserProfile = async (session: IAuthSession): Promise<IUserProfile> => {
  const res = await api().post('/user/profile', session);
  return res.data;
};
