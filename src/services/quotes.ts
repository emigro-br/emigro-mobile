import { api } from './api';

export interface IQuoteRequest {
  from: string;
  to: string;
  amount: string;
}

export interface IQuoteResponse {
  source_asset_code: string;
  source_amount: string;
  destination_asset_code: string;
  destination_amount: string;
}

export const handleQuote = async (data: IQuoteRequest): Promise<IQuoteResponse | null> => {
  const res = await api().post('/quote', data);
  return res.data;
};
