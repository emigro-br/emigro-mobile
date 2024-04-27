import { api } from './api';

type QuoteType = 'strict_send' | 'strict_receive';

export interface IQuoteRequest {
  from: string;
  to: string;
  amount: string;
  type: QuoteType;
}

export interface IQuoteResponse {
  source_asset_code: string;
  source_amount: number;
  destination_asset_code: string;
  destination_amount: number;
  quote_type: QuoteType;
}

export const handleQuote = async (data: IQuoteRequest): Promise<IQuoteResponse | null> => {
  const res = await api().post('/quote', data);
  return res.data;
};
