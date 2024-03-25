import mockAxios from 'jest-mock-axios';

import { IAuthSession } from '@/types/IAuthSession';
import { IQuoteRequest } from '@/types/IQuoteRequest';
import { ITransactionRequest } from '@/types/ITransactionRequest';

import {
  getTransactions,
  getUserBalance,
  getUserProfile,
  getUserPublicKey,
  handleQuote,
  sendTransaction,
} from '../emigro';

describe('getTransactions', () => {
  const mockResponse = {
    data: {
      transactions: [
        { id: 1, amount: 10 },
        { id: 2, amount: 20 },
      ],
    },
  };

  afterEach(() => {
    mockAxios.reset();
  });

  it('should make a GET request to fetch transactions and return the transaction data', async () => {
    mockAxios.get.mockResolvedValue(mockResponse);
    const result = await getTransactions();

    expect(mockAxios.get).toHaveBeenCalledWith('/transaction/all');
    expect(result).toEqual(mockResponse.data.transactions);
  });
});

describe('getUserBalance', () => {
  const mockResponse = {
    data: {
      balances: [
        { assetType: 'native', balance: 100 },
        { assetType: 'custom', balance: 200 },
      ],
    },
  };

  afterEach(() => {
    mockAxios.reset();
  });

  it('should make a GET request to fetch user balance and return the balance data', async () => {
    mockAxios.get.mockResolvedValue(mockResponse);
    const result = await getUserBalance();

    expect(mockAxios.get).toHaveBeenCalledWith('/user');
    expect(result).toEqual(mockResponse.data.balances);
  });

  it('should throw an error if no balances are found', async () => {
    mockAxios.get.mockResolvedValue({ data: {} });
    await expect(getUserBalance()).rejects.toThrow('No balances found');
  });
});

describe('handleQuote', () => {
  const mockRequest: IQuoteRequest = { from: 'me', to: 'you', amount: '100' };
  const mockResponse = { data: { quote: '50' } };

  afterEach(() => {
    mockAxios.reset();
  });

  it('should make a POST request to handle quote and return the quote value as a number', async () => {
    mockAxios.post.mockResolvedValue(mockResponse);
    const result = await handleQuote(mockRequest);

    expect(mockAxios.post).toHaveBeenCalledWith('/quote', mockRequest);
    expect(result).toEqual(50);
  });
});

describe('sendTransaction', () => {
  const mockRequest: ITransactionRequest = {
    maxAmountToSend: '100',
    destinationAmount: '50',
    destination: 'you',
    sourceAssetCode: 'XLM',
    destinationAssetCode: 'XLM',
  };
  const mockResponse = { data: { success: true } };

  afterEach(() => {
    mockAxios.reset();
  });

  it('should make a POST request to send transaction and return the payment response', async () => {
    mockAxios.post.mockResolvedValue(mockResponse);
    const result = await sendTransaction(mockRequest);

    expect(mockAxios.post).toHaveBeenCalledWith('/transaction', mockRequest);
    expect(result).toEqual(mockResponse.data);
  });
});

describe('getUserPublicKey', () => {
  const mockResponse = { data: { publicKey: 'abc123' } };

  afterEach(() => {
    mockAxios.reset();
  });

  it('should make a GET request to fetch user public key and return the public key', async () => {
    mockAxios.get.mockResolvedValue(mockResponse);
    const result = await getUserPublicKey();

    expect(mockAxios.get).toHaveBeenCalledWith('/user');
    expect(result).toEqual(mockResponse.data.publicKey);
  });
});

describe('getUserProfile', () => {
  const mockSession: IAuthSession = { accessToken: 'abc123' } as IAuthSession;
  const mockResponse = { data: { name: 'John Doe', email: 'john@example.com' } };

  afterEach(() => {
    mockAxios.reset();
  });

  it('should make a POST request to fetch user profile and return the profile data', async () => {
    mockAxios.post.mockResolvedValue(mockResponse);
    const result = await getUserProfile(mockSession);

    expect(mockAxios.post).toHaveBeenCalledWith('/user/profile', mockSession);
    expect(result).toEqual(mockResponse.data);
  });
});
