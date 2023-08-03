import AsyncStorage from '@react-native-async-storage/async-storage';

import { IQuote } from '@/types/IQuote';
import { ITransactionRequest } from '@/types/ITransactionRequest';

import { GET_USER_BALANCE_ERROR, QUOTE_NOT_AVAILABLE_ERROR, TRANSACTION_ERROR_MESSAGE } from '@constants/errorMessages';

const BACKEND_URL = process.env.BACKEND_URL;

export const getUserBalance = async () => {
  const url = `${BACKEND_URL}/user`;
  const token = await AsyncStorage.getItem('authToken');
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return await response.json();
  } catch (error) {
    console.error(error, GET_USER_BALANCE_ERROR);
  }
};

export const handleQuote = async (quote: IQuote) => {
  const url = `${BACKEND_URL}/quote`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quote),
    });
    return await response.json();
  } catch (error) {
    console.error(error, QUOTE_NOT_AVAILABLE_ERROR);
  }
};

export const sendTransaction = async (transactionRequest: ITransactionRequest) => {
  const url = `${BACKEND_URL}/transaction`;
  const token = await AsyncStorage.getItem('authToken');
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(transactionRequest),
    });
    return await response.json();
  } catch (error) {
    console.error(error, TRANSACTION_ERROR_MESSAGE);
  }
};
