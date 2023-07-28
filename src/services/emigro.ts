import AsyncStorage from '@react-native-async-storage/async-storage';

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

export const handleQuote = async (fromValue: string, toValue: string, amount: string) => {
  const url = `${BACKEND_URL}/quote`;
  const quoteRequest = {
    from: fromValue,
    to: toValue,
    amount: amount,
  };
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quoteRequest),
    });
    return await response.json();
  } catch (error) {
    console.error(error, QUOTE_NOT_AVAILABLE_ERROR);
  }
};

export const sendTransaction = async (destinationAmount: string, detination: string) => {
  const url = `${BACKEND_URL}/transaction`;
  const token = await AsyncStorage.getItem('authToken');
  const transactionRequest = {
    maxAmountToSend: '500',
    destinationAmount,
    detination,
  };
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
