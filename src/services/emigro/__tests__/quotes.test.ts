import axios, { AxiosInstance } from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { api } from '@/services/emigro/api';
import { IQuoteRequest, IQuoteResponse, fetchQuote } from '@/services/emigro/quotes';

jest.mock('../api', () => ({
  api: jest.fn(),
}));

describe('quotes service', () => {
  let mock: MockAdapter;
  let instance: AxiosInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    instance = axios.create();
    mock = new MockAdapter(instance, { onNoMatch: 'throwException' });
    (api as jest.Mock).mockReturnValue(instance);
  });

  describe('fetchQuote', () => {
    const mockRequest: IQuoteRequest = {
      type: 'strict_send',
      from: 'XLM',
      to: 'USDC',
      amount: '100',
    };
    const mockResponse: IQuoteResponse = {
      quote_type: 'strict_send',
      source_asset_code: 'XLM',
      source_amount: 100,
      destination_asset_code: 'USDC',
      destination_amount: 50,
      price: 0.5,
    };

    it('should make a POST request to handle quote and return the quote value as a number', async () => {
      const mockAxiosPost = jest.spyOn(instance, 'post');
      mock.onPost('/quote').reply(200, mockResponse);
      const result = await fetchQuote(mockRequest);

      expect(mockAxiosPost).toHaveBeenCalledWith('/quote', mockRequest);
      expect(result).toEqual(mockResponse);
    });
  });
});
