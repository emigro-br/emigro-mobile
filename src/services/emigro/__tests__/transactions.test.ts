import axios, { AxiosInstance } from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { api } from '../api';
import { payment, swap, transfer } from '../transactions';
import { CreatePaymentTransaction, CreateSwapTransaction, CreateTransferTransaction } from '../types';

jest.mock('../api', () => ({
  api: jest.fn(),
}));

describe('transaction service', () => {
  let mock: MockAdapter;
  let instance: AxiosInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    instance = axios.create();
    mock = new MockAdapter(instance, { onNoMatch: 'throwException' });
    (api as jest.Mock).mockReturnValue(instance);
  });

  describe('swap', () => {
    it('should make a POST request to /transaction/swap with the provided data', async () => {
      const mockAxiosPost = jest.spyOn(instance, 'post');
      const mockApiResponse = {
        id: 'testId',
        type: 'swap',
        amount: 100,
        status: 'completed',
      };
      const data: CreateSwapTransaction = {
        fromAsset: 'testAsset1',
        toAsset: 'testAsset2',
        amount: 100,
        estimated: 200,
      };
      mock.onPost('/transaction/swap').reply(200, mockApiResponse);
      const result = await swap(data);
      expect(mockAxiosPost).toHaveBeenCalledWith('/transaction/swap', data);
      expect(result).toEqual(mockApiResponse);
    });
  });
  describe('transfer', () => {
    it('should make a POST request to /transaction/transfer with the provided data', async () => {
      const mockAxiosPost = jest.spyOn(instance, 'post');
      const mockApiResponse = {
        id: 'testId',
        type: 'transfer',
        amount: 100,
        status: 'completed',
      };
      const data: CreateTransferTransaction = {
        destinationAddress: 'testAddress',
        assetCode: 'testAsset',
        amount: 100,
      };
      mock.onPost('/transaction/transfer').reply(200, mockApiResponse);
      const result = await transfer(data);
      expect(mockAxiosPost).toHaveBeenCalledWith('/transaction/transfer', data);
      expect(result).toEqual(mockApiResponse);
    });
  });
  describe('payment', () => {
    it('should make a POST request to /transaction/payment with the provided data', async () => {
      const mockAxiosPost = jest.spyOn(instance, 'post');
      const mockApiResponse = {
        id: 'testId',
        type: 'payment',
        amount: 100,
        status: 'completed',
      };
      const data: CreatePaymentTransaction = {
        destinationAddress: 'testAddress',
        sendAssetCode: 'testAsset',
        destAssetCode: 'testAsset2',
        destAmount: 100,
        sendMax: 100,
      };
      mock.onPost('/transaction/payment').reply(200, mockApiResponse);
      const result = await payment(data);
      expect(mockAxiosPost).toHaveBeenCalledWith('/transaction/payment', data);
      expect(result).toEqual(mockApiResponse);
    });
  });
});
