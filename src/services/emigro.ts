import AsyncStorage from '@react-native-async-storage/async-storage';

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
    const userBalance = await response.json();
    return userBalance;
  } catch (error) {
    console.error(error);
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
    const quoteResponse = await response.json();
    return quoteResponse;
  } catch (error) {
    console.error(error, 'Error to get quote');
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
    const transactionResponse = await response.json();
    return transactionResponse;
  } catch (error) {
    console.error(error);
  }
};
