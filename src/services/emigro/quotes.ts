import { api } from './api';

type QuoteType = 'strict_send' | 'strict_receive';

export interface IQuoteRequest {
  from: string;
  to: string;
  amount: string;
  type: QuoteType;
}

export interface IQuoteResponse {
  quote_type: QuoteType;
  source_asset_code: string;
  source_amount: number;
  destination_asset_code: string;
  destination_amount: number;
  price: number;
}

export const fetchQuote = async (data: IQuoteRequest): Promise<IQuoteResponse | null> => {
  const res = await api().post('/quote', data);
  return res.data;
};
