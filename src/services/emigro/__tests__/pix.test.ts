import axios, { AxiosInstance } from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { api } from '../api';
import { brcodePaymentPreview, createBrcodePayment, getBrcodePayment } from '../pix';
import { BrcodePaymentRequest, BrcodePaymentResponse, PixPaymentPreview } from '../types';

jest.mock('../api', () => ({
  api: jest.fn(),
}));

describe('pix service', () => {
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
  });
});
