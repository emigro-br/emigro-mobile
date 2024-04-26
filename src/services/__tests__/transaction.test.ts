import axios, { AxiosInstance } from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { ITransactionRequest } from '@/types/ITransactionRequest';

import { api } from '../api';
import { PaymentPreview, brcodePayment, brcodePaymentPreview, getTransactions, sendTransaction } from '../transaction';

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

  describe('sendTransaction', () => {
    const mockRequest: ITransactionRequest = {
      type: 'payment',
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

  describe('brcodePaymentPreview', () => {
    it('should make a POST request to /transaction/payment-preview with the provided brcode', async () => {
      const mockAxiosPost = jest.spyOn(instance, 'post');
      const mockApiResponse: PaymentPreview = {
        type: 'brcode-payment',
        payment: {
          pixKey: 'testPixKey',
          amount: 100,
          bankName: 'Test Bank',
          name: 'Test Name',
          taxId: '123456789',
          txId: 'testTxId',
        },
      };

      mock.onPost('/transaction/payment-preview', { brcode: 'testBrcode' }).reply(200, mockApiResponse);

      const brcode = 'testBrcode';
      const result = await brcodePaymentPreview(brcode);

      expect(mockAxiosPost).toHaveBeenCalledWith('/transaction/payment-preview', { brcode });
      expect(result).toEqual(mockApiResponse);
    });
  });

  describe('brcodePayment', () => {
    it('should make a POST request to /transaction/brcode-payment with the provided data', async () => {
      const mockAxiosPost = jest.spyOn(instance, 'post');
      const mockApiResponse = {
        success: true,
        message: 'Payment successful',
      };

      mock.onPost('/transaction/brcode-payment').reply(200, mockApiResponse);

      const data = {
        brcode: 'testBrcode',
        sourceAsset: 'testAsset',
        amount: 100,
        taxId: '123456789',
        description: 'Test payment',
      };

      const result = await brcodePayment(data);

      expect(mockAxiosPost).toHaveBeenCalledWith('/transaction/brcode-payment', data);
      expect(result).toEqual(mockApiResponse);
    });
  });
});
