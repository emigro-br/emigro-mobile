import axios, { AxiosInstance } from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { api } from '../api';
import { PaymentPreview, brcodePayment, brcodePaymentPreview } from '../transaction';

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
