import axios, { AxiosInstance } from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { api } from '@/services/emigro/api';
import { CryptoAsset } from '@/types/assets';

import {
  CallbackType,
  OperationKind,
  confirmWithdraw,
  depositUrl,
  getTransaction,
  listTransactions,
  withdrawUrl,
} from '../anchors';
import { InteractiveUrlRequest, InteractiveUrlResponse, Sep24Transaction, Sep24TransactionStatus } from '../types';

jest.mock('../api', () => ({
  api: jest.fn(),
}));

describe('anchor service', () => {
  let mock: MockAdapter;
  let instance: AxiosInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    instance = axios.create();
    mock = new MockAdapter(instance, { onNoMatch: 'throwException' });
    (api as jest.Mock).mockReturnValue(instance);
  });

  describe('getInteractiveDepositUrl', () => {
    const anchorParams: InteractiveUrlRequest = {
      asset_code: 'USD',
    };

    it('should make a POST request to get the interactive deposit URL', async () => {
      const mockAxiosPost = jest.spyOn(instance, 'post');
      const mockResponse: InteractiveUrlResponse = {
        url: 'https://example.com/deposit',
        id: '123456789',
        type: 'deposit',
      };

      mock.onPost('/anchor/deposit').reply(200, mockResponse);

      const result = await depositUrl(anchorParams, CallbackType.EVENT_POST_MESSAGE);

      const expectedResult = { ...mockResponse, url: `${mockResponse.url}&callback=postMessage` };
      expect(result).toEqual(expectedResult);
      expect(mockAxiosPost).toHaveBeenCalledWith('/anchor/deposit', anchorParams);
    });
  });

  describe('getInteractiveWithdrawUrl', () => {
    const anchorParams: InteractiveUrlRequest = {
      asset_code: 'USD',
    };

    it('should make a POST request to get the interactive withdraw URL', async () => {
      const mockAxiosPost = jest.spyOn(instance, 'post');
      const mockResponse: InteractiveUrlResponse = {
        url: 'https://example.com/withdraw',
        type: 'withdraw',
        id: '123456789',
      };

      mock.onPost('/anchor/withdraw').reply(200, mockResponse);

      const result = await withdrawUrl(anchorParams, CallbackType.EVENT_POST_MESSAGE);

      const expectedResult = { ...mockResponse, url: `${mockResponse.url}&callback=postMessage` };
      expect(result).toEqual(expectedResult);

      expect(mockAxiosPost).toHaveBeenCalledWith('/anchor/withdraw', anchorParams);
    });
  });

  describe('getTransaction', () => {
    const id = '123456789';
    const assetCode: CryptoAsset = CryptoAsset.USDC;

    it('should make a GET request to get the transaction', async () => {
      const mockAxiosGet = jest.spyOn(instance, 'get');
      const mockResponse: Sep24Transaction = {
        id: '123456789',
        amount_in: '100',
        status: Sep24TransactionStatus.COMPLETED,
      } as Sep24Transaction;

      mock.onGet('/anchor/transaction').reply(200, mockResponse);

      const result = await getTransaction(id, assetCode);

      expect(result).toEqual(mockResponse);
      expect(mockAxiosGet).toHaveBeenCalledWith('/anchor/transaction', { params: { id, assetCode } });
    });
  });

  describe('listTransactions', () => {
    const assetCode: CryptoAsset = CryptoAsset.USDC;

    it('should make a GET request to get the withdrawal transactions', async () => {
      const mockAxiosGet = jest.spyOn(instance, 'get');
      const transaction: Sep24Transaction = {
        id: '123456789',
        amount_in: '100',
        status: Sep24TransactionStatus.COMPLETED,
      } as Sep24Transaction;
      const mockResponse = { transactions: [transaction] };

      mock.onGet('/anchor/transactions').reply(200, mockResponse);

      const result = await listTransactions(assetCode, OperationKind.WITHDRAW);

      expect(result).toEqual(mockResponse.transactions);
      expect(mockAxiosGet).toHaveBeenCalledWith('/anchor/transactions', {
        params: { assetCode, kind: 'withdrawal', limit: 5 },
      });
    });
  });

  describe('confirmWithdraw', () => {
    const data = {
      transactionId: '123456789',
      assetCode: 'USD',
      from: '123456789',
    };

    it('should make a POST request to confirm the withdraw', async () => {
      const mockAxiosPost = jest.spyOn(instance, 'post');
      const mockResponse = { success: true };

      mock.onPost('/anchor/withdraw-confirm').reply(200, mockResponse);

      const result = await confirmWithdraw(data);

      expect(result).toEqual(mockResponse);
      expect(mockAxiosPost).toHaveBeenCalledWith('/anchor/withdraw-confirm', data);
    });
  });
});
