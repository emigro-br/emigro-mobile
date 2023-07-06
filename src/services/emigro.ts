import AsyncStorage, { useAsyncStorage } from '@react-native-async-storage/async-storage';

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

    if (!response.ok) {
      throw new Error('Request failed');
    }
    const responseData = await response.json();
    console.log(responseData, 'data balance');
  } catch (error) {
    console.error(error);
  }
};

export const handleQuote = async (fromValue: string, toValue: string, amount: string) => {
  const url = `${BACKEND_URL}/quote`;
  const data = {
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
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Request failed');
    }
    const responseData = await response.json();
    console.log(responseData, 'data emigro');
    return responseData;
  } catch (error) {
    console.error(error, 'error de emigro');
  }
};

export const sendTransaction = async (destinationAmount: string, detination: string) => {
  const url = `${BACKEND_URL}/transaction`;
  const token = await AsyncStorage.getItem('authToken');
  const data = {
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
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Request failed');
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error(error);
  }
};
