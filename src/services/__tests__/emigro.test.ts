import axios, { AxiosInstance } from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { IAuthSession } from '@/types/IAuthSession';
import { ITransactionRequest } from '@/types/ITransactionRequest';
import { CryptoAsset } from '@/types/assets';

import { api } from '@services/api';

import {
  addAssetToWallet,
  getTransactions,
  getUserBalance,
  getUserProfile,
  getUserPublicKey,
  sendTransaction,
} from '../emigro';

jest.mock('../api', () => ({
  api: jest.fn(),
}));

describe('emigro service', () => {
  let mock: MockAdapter;
  let instance: AxiosInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    instance = axios.create();
    mock = new MockAdapter(instance, { onNoMatch: 'throwException' });
    (api as jest.Mock).mockReturnValue(instance);
  });

  describe('getTransactions', () => {
    const mockResponse = {
      transactions: [
        { id: 1, amount: 10 },
        { id: 2, amount: 20 },
      ],
    };

    it('should make a GET request to fetch transactions and return the transaction data', async () => {
      // const mockAxiosGet = jest.spyOn(instance, 'get');
      mock.onGet('/transaction/all').reply(200, mockResponse);
      const result = await getTransactions();

      // expect(mockAxiosGet).toHaveBeenCalledWith('/transaction/all');
      expect(result).toEqual(mockResponse.transactions);
    });
  });

  describe('getUserBalance', () => {
    const mockResponse = {
      balances: [
        { assetCode: 'USD', balance: 100 },
        { assetCode: 'BRL', balance: 200 },
      ],
    };

    it('should make a GET request to fetch user balance and return the balance data', async () => {
      const mockAxiosGet = jest.spyOn(instance, 'get');
      mock.onGet('/user').reply(200, mockResponse);
      const result = await getUserBalance();

      expect(mockAxiosGet).toHaveBeenCalledWith('/user');
      expect(result).toEqual(mockResponse.balances);
    });

    it('should throw an error if no balances are found', async () => {
      mock.onGet('/user').reply(200, {});
      await expect(getUserBalance()).rejects.toThrow('No balances found');
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
    const mockResponse = { success: true };

    it('should make a POST request to send transaction and return the payment response', async () => {
      const mockAxiosPost = jest.spyOn(instance, 'post');
      mock.onPost('/transaction').reply(200, mockResponse);
      const result = await sendTransaction(mockRequest);

      expect(mockAxiosPost).toHaveBeenCalledWith('/transaction', mockRequest);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getUserPublicKey', () => {
    const mockResponse = { publicKey: 'abc123' };

    it('should make a GET request to fetch user public key and return the public key', async () => {
      const mockAxiosGet = jest.spyOn(instance, 'get');
      mock.onGet('/user').reply(200, mockResponse);
      const result = await getUserPublicKey();

      expect(mockAxiosGet).toHaveBeenCalledWith('/user');
      expect(result).toEqual(mockResponse.publicKey);
    });
  });

  describe('getUserProfile', () => {
    const mockSession: IAuthSession = { accessToken: 'abc123' } as IAuthSession;
    const mockResponse = { name: 'John Doe', email: 'john@example.com' };

    it('should make a POST request to fetch user profile and return the profile data', async () => {
      const mockAxiosPost = jest.spyOn(instance, 'post');
      mock.onPost('/user/profile').reply(200, mockResponse);
      const result = await getUserProfile(mockSession);

      expect(mockAxiosPost).toHaveBeenCalledWith('/user/profile', mockSession);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('addAssetToWallet', () => {
    const mockAssetCode: CryptoAsset = CryptoAsset.BRL;
    const mockResponse = {
      balances: [
        { assetCode: 'USD', balance: 100 },
        { assetCode: 'BRL', balance: 200 },
      ],
    };

    it('should make a POST request to add asset to wallet and return the updated user profile', async () => {
      const mockAxiosPost = jest.spyOn(instance, 'post');
      mock.onPost('/user/wallet/assets').reply(200, mockResponse);
      const result = await addAssetToWallet(mockAssetCode);

      expect(mockAxiosPost).toHaveBeenCalledWith('/user/wallet/assets', { assetCode: mockAssetCode });
      expect(result).toEqual(mockResponse.balances);
    });
  });
});
