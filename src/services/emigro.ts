import AsyncStorage from '@react-native-async-storage/async-storage';

import { getAccessToken } from '../storage/helpers';

import { IBalance } from '@/types/IBalance';
import { IPaymentResponse } from '@/types/IPaymentResponse';
import { IQuote } from '@/types/IQuote';
import { IQuoteRequest } from '@/types/IQuoteRequest';
import { ITransaction } from '@/types/ITransaction';
import { ITransactionRequest } from '@/types/ITransactionRequest';
import { IUserProfile } from '@/types/IUserProfile';

import { GET_USER_BALANCE_ERROR, QUOTE_NOT_AVAILABLE_ERROR, TRANSACTION_ERROR_MESSAGE } from '@constants/errorMessages';

const BACKEND_URL = process.env.BACKEND_URL;

export const getTransactions = async (): Promise<ITransaction[]> => {
  const transactionsUrl = `${BACKEND_URL}/transaction/all`;
  const accessToken = await getAccessToken();

  try {
    const response = await fetch(transactionsUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const { transactions } = await response.json();
    return transactions;
  } catch (error) {
    console.error(error);
    throw new Error();
  }
};

export const getUserBalance = async (): Promise<IBalance[]> => {
  const url = `${BACKEND_URL}/user`;
  const accessToken = await getAccessToken();
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const { balances } = await response.json();

    return balances;
  } catch (error) {
    console.error(error, GET_USER_BALANCE_ERROR);
    throw new Error();
  }
};

export const handleQuote = async (body: IQuoteRequest): Promise<IQuote> => {
  const url = `${BACKEND_URL}/quote`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const { quote } = await response.json();
    return quote;
  } catch (error) {
    console.error(error, QUOTE_NOT_AVAILABLE_ERROR);
    throw new Error();
  }
};

export const sendTransaction = async (transactionRequest: ITransactionRequest): Promise<IPaymentResponse> => {
  const url = `${BACKEND_URL}/transaction`;
  const accessToken = await getAccessToken();
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(transactionRequest),
    });
    return await response.json();
  } catch (error) {
    console.error(error, TRANSACTION_ERROR_MESSAGE);
    throw new Error();
  }
};

export const getUserPublicKey = async (): Promise<string> => {
  const url = `${BACKEND_URL}/user`;
  const accessToken = await getAccessToken();

  try {
    const request = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const { publicKey } = await request.json();
    return publicKey;
  } catch (error) {
    console.error(error, GET_USER_BALANCE_ERROR);
    throw error;
  }
};

export const getUserProfile = async (): Promise<IUserProfile> => {
  const url = `${BACKEND_URL}/user/profile`;
  const session = await AsyncStorage.getItem('session');
  const parsedSession = session ? JSON.parse(session) : null;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${parsedSession?.accessToken}`,
      },
      body: JSON.stringify(parsedSession),
    });
    return await response.json();
  } catch (error) {
    console.error(error);
    throw new Error();
  }
};
