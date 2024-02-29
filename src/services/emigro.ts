import { IAuthSession } from '@/types/IAuthSession';
import { IBalance } from '@/types/IBalance';
import { IPaymentResponse } from '@/types/IPaymentResponse';
import { IQuote } from '@/types/IQuote';
import { IQuoteRequest } from '@/types/IQuoteRequest';
import { ITransaction } from '@/types/ITransaction';
import { ITransactionRequest } from '@/types/ITransactionRequest';
import { IUserProfile } from '@/types/IUserProfile';

import { GET_USER_BALANCE_ERROR, QUOTE_NOT_AVAILABLE_ERROR, TRANSACTION_ERROR_MESSAGE } from '@constants/errorMessages';

import { CustomError } from './errors';
import { fetchWithTokenCheck } from './utils';

const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

export const getTransactions = async (): Promise<ITransaction[]> => {
  const transactionsUrl = `${backendUrl}/transaction/all`;

  try {
    const response = await fetchWithTokenCheck(transactionsUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
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
  const url = `${backendUrl}/user`;
  try {
    const res = await fetchWithTokenCheck(url, {
      method: 'GET',
    });
    const json = await res.json();

    if (!res.ok) {
      if (json.error) {
        throw new Error(json.error.message);
      }
      throw new Error(res.statusText);
    }

    const { balances } = json;
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
  } catch (error) {
    console.error(error);
    throw new Error(GET_USER_BALANCE_ERROR);
  }
};

export const handleQuote = async (body: IQuoteRequest): Promise<IQuote> => {
  const url = `${backendUrl}/quote`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error?.message || res.statusText);
    }

    const { quote } = json;
    return quote;
  } catch (error) {
    console.error(error);
    throw new Error(QUOTE_NOT_AVAILABLE_ERROR);
  }
};

export const sendTransaction = async (transactionRequest: ITransactionRequest): Promise<IPaymentResponse> => {
  const url = `${backendUrl}/transaction`;
  try {
    const res = await fetchWithTokenCheck(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transactionRequest),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error?.message || res.statusText);
    }

    return json;
  } catch (error) {
    console.error(error);
    throw new Error(TRANSACTION_ERROR_MESSAGE);
  }
};

export const getUserPublicKey = async (): Promise<string> => {
  const url = `${backendUrl}/user`;

  try {
    const request = await fetchWithTokenCheck(url, {
      method: 'GET',
    });
    const { publicKey } = await request.json();
    return publicKey;
  } catch (error) {
    console.error(error);
    throw error; // TODO: create new error message?
  }
};

export const getUserProfile = async (session: IAuthSession): Promise<IUserProfile> => {
  const url = `${backendUrl}/user/profile`;
  try {
    const res = await fetchWithTokenCheck(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(session),
    });
    const json = await res.json();
    if (!res.ok) {
      if (json.error) {
        throw CustomError.fromJSON(json.error);
      }
      throw new Error(res.statusText);
    }

    return json;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
