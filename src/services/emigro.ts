import { IBalance } from '@/types/IBalance';
import { IPaymentResponse } from '@/types/IPaymentResponse';
import { IQuote } from '@/types/IQuote';
import { IQuoteRequest } from '@/types/IQuoteRequest';
import { ITransaction } from '@/types/ITransaction';
import { ITransactionRequest } from '@/types/ITransactionRequest';
import { IUserProfile } from '@/types/IUserProfile';
import { refresh as refreshSession } from '@/services/auth';
import { getSession, saveSession } from '@/storage/helpers';

import { GET_USER_BALANCE_ERROR, QUOTE_NOT_AVAILABLE_ERROR, TRANSACTION_ERROR_MESSAGE } from '@constants/errorMessages';

const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;


export class NotAuhtorized extends Error {
  constructor() {
    super('Not authorized');
  }
}

export const fetchWithTokenCheck = async (url: string, options: RequestInit): Promise<Response> => {

  let session = await getSession();
  if (!session) {
    throw new NotAuhtorized();
  }

  const { tokenExpirationDate } = session;
  const isTokenExpired = tokenExpirationDate < new Date();

  if (isTokenExpired) {
    console.debug('Token expired, refreshing...');
    const newSession = await refreshSession(session);
    if (newSession) {
      saveSession(newSession);
      session = newSession;
    } else {
      throw new Error('Could not refresh session');
    }
  }

  const { accessToken } = session;
  options.headers = {
    ...options.headers,
    Authorization: `Bearer ${accessToken}`,
  };

  return fetch(url, options);
}

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
    const response = await fetchWithTokenCheck(url, {
      method: 'GET',
    });
    const json = await response.json();

    if (json.statusCode === 401) {
      throw new NotAuhtorized();
    }

    const { balances } = json;
    return balances;
  } catch (error) {
    console.error(error, GET_USER_BALANCE_ERROR);
    throw new Error();
  }
};

export const handleQuote = async (body: IQuoteRequest): Promise<IQuote> => {
  const url = `${backendUrl}/quote`;

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
  const url = `${backendUrl}/transaction`;
  try {
    const response = await fetchWithTokenCheck(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
  const url = `${backendUrl}/user`;

  try {
    const request = await fetchWithTokenCheck(url, {
      method: 'GET',
    });
    const { publicKey } = await request.json();
    return publicKey;
  } catch (error) {
    console.error(error, GET_USER_BALANCE_ERROR);
    throw error;
  }
};

export const getUserProfile = async (): Promise<IUserProfile> => {
  const url = `${backendUrl}/user/profile`;
  try {
    const session = await getSession();
    const response = await fetchWithTokenCheck(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(session),
    });
    const json = await response.json();
    if (json.statusCode === 401) {
      throw new NotAuhtorized();
    }
    return json
  } catch (error) {
    console.error(error);
    throw error;
  }
};
