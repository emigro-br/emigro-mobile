import axios, { AxiosInstance } from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { api } from '@/services/emigro/api';
import { CryptoAsset } from '@/types/assets';

import { AuthSession, StellarAccount } from '../types';
import { addAssetToWallet, createWallet, getUser, getUserBalance, getUserProfile, saveUserPreferences } from '../users';

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

  describe('getUserBalance', () => {
    const mockResponse = {
      balances: [
        { assetCode: 'USDC', balance: 100 },
        { assetCode: 'ARS', balance: 200 },
      ],
    };

    it('should make a GET request to fetch user balance and return the balance data', async () => {
      const mockAxiosGet = jest.spyOn(instance, 'get');
      mock.onGet('/user/wallet').reply(200, mockResponse);
      const result = await getUserBalance();

      expect(mockAxiosGet).toHaveBeenCalledWith('/user/wallet');
      expect(result).toEqual(mockResponse.balances);
    });

    it('should throw an error if no balances are found', async () => {
      mock.onGet('/user/wallet').reply(200, {});
      await expect(getUserBalance()).rejects.toThrow('No balances found');
    });
  });

  describe('getUser', () => {
    const mockResponse = { publicKey: 'abc123' };

    it('should make a GET request to fetch user', async () => {
      const mockAxiosGet = jest.spyOn(instance, 'get');
      mock.onGet('/user').reply(200, mockResponse);
      const result = await getUser();

      expect(mockAxiosGet).toHaveBeenCalledWith('/user');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getUserProfile', () => {
    const mockSession: AuthSession = { accessToken: 'abc123' } as AuthSession;
    const mockResponse = { name: 'John Doe', email: 'john@example.com' };

    it('should make a POST request to fetch user profile and return the profile data', async () => {
      const mockAxiosPost = jest.spyOn(instance, 'post');
      mock.onPost('/user/profile').reply(200, mockResponse);
      const result = await getUserProfile(mockSession);

      expect(mockAxiosPost).toHaveBeenCalledWith('/user/profile', mockSession);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createWallet', () => {
    const mockResponse: StellarAccount = {
      publicKey: 'abc123',
      balances: [
        { assetCode: 'USDC', assetType: '', balance: '100', priceUSD: 1 },
        { assetCode: 'EURC', assetType: '', balance: '200', priceUSD: 5 },
      ],
    };

    it('should make a POST request to create a stellar account', async () => {
      const mockAxiosPost = jest.spyOn(instance, 'post');
      mock.onPost('/user/wallet').reply(200, mockResponse);
      const result = await createWallet();

      expect(mockAxiosPost).toHaveBeenCalledWith('/user/wallet');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('addAssetToWallet', () => {
    const mockAssetCode: CryptoAsset = CryptoAsset.EURC;
    const mockResponse = {
      balances: [
        { assetCode: 'USDC', balance: 100 },
        { assetCode: 'EURC', balance: 200 },
      ],
    };

    it('should make a POST request to add asset to wallet and return the updated balance', async () => {
      const mockAxiosPost = jest.spyOn(instance, 'post');
      mock.onPost('/user/wallet/assets').reply(200, mockResponse);
      const result = await addAssetToWallet(mockAssetCode);

      expect(mockAxiosPost).toHaveBeenCalledWith('/user/wallet/assets', { assetCode: mockAssetCode });
      expect(result).toEqual(mockResponse.balances);
    });
  });

  describe('saveUserPreferences', () => {
    const mockPreferences = { theme: 'dark', language: 'en' };
    const mockResponse = mockPreferences;

    it('should make a POST request to save user preferences', async () => {
      const mockAxiosPost = jest.spyOn(instance, 'post');
      mock.onPost('/user/preferences').reply(200, mockResponse);
      const result = await saveUserPreferences(mockPreferences);

      expect(mockAxiosPost).toHaveBeenCalledWith('/user/preferences', mockPreferences);
      expect(result).toEqual(mockResponse);
    });
  });
});
