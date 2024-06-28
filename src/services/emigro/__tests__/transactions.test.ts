import axios, { AxiosInstance } from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { api } from '../api';
import { brcodePaymentPreview, createBrcodePayment, getBrcodePayment, payment, swap, transfer } from '../transactions';
import {
  BrcodePaymentRequest,
  BrcodePaymentResponse,
  CreatePaymentTransaction,
  CreateSwapTransaction,
  CreateTransferTransaction,
  PixPaymentPreview,
} from '../types';

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

  describe('brcodePaymentPreview', () => {
    it('should make a POST request to /pix/payment-preview with the provided brcode', async () => {
      const mockAxiosPost = jest.spyOn(instance, 'post');
      const mockApiResponse: PixPaymentPreview = {
        brcode: 'testBrcode',
        pixKey: 'testPixKey',
        amount: 100,
        bankName: 'Test Bank',
        name: 'Test Name',
        taxId: '123456789',
        txId: 'testTxId',
      };

      mock.onPost('/pix/payment-preview', { brcode: 'testBrcode' }).reply(200, mockApiResponse);

      const brcode = 'testBrcode';
      const result = await brcodePaymentPreview(brcode);

      expect(mockAxiosPost).toHaveBeenCalledWith('/pix/payment-preview', { brcode });
      expect(result).toEqual(mockApiResponse);
    });
  });

  describe('brcodePayment', () => {
    it('should make a POST request to /pix/brcode-payment with the provided data', async () => {
      const mockAxiosPost = jest.spyOn(instance, 'post');
      const mockApiResponse = {
        success: true,
        message: 'Payment successful',
      };

      mock.onPost('/pix/brcode-payment').reply(200, mockApiResponse);

      const data: BrcodePaymentRequest = {
        brcode: 'testBrcode',
        exchangeAsset: 'testAsset',
        amount: 100,
        name: 'Test Name',
        taxId: '123456789',
        description: 'Test payment',
      };

      const result = await createBrcodePayment(data);

      expect(mockAxiosPost).toHaveBeenCalledWith('/pix/brcode-payment', data);
      expect(result).toEqual(mockApiResponse);
    });
  });

  describe('getBrcodePayment', () => {
    const mockResponse: BrcodePaymentResponse = {
      id: 'testId',
      brcode: 'testBrcode',
      status: 'paid',
      amount: 100,
      name: 'Test Name',
      taxId: '123456789',
      description: 'Test payment',
    };

    it('should make a GET request to fetch the brcode payment and return the payment response', async () => {
      const mockAxiosGet = jest.spyOn(instance, 'get');
      const transactionId = 'testTransactionId';
      mock.onGet(`/pix/brcode-payment/${transactionId}`).reply(200, mockResponse);
      const result = await getBrcodePayment(transactionId);

      expect(mockAxiosGet).toHaveBeenCalledWith(`/pix/brcode-payment/${transactionId}`);
      expect(result).toEqual(mockResponse);
    });
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
