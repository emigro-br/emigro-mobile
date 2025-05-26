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
  try {
    console.log('[fetchQuote] Sending quote request with data:', data);

    const res = await api().post('/quote', data);
    console.log('[fetchQuote] Raw response:', res.data);

    // Validate the response structure
    if (
      res.data &&
      !isNaN(parseFloat(res.data.source_amount)) &&
      !isNaN(parseFloat(res.data.destination_amount)) &&
      !isNaN(parseFloat(res.data.price))
    ) {
      return {
        ...res.data,
        source_amount: parseFloat(res.data.source_amount), // Ensure numeric types
        destination_amount: parseFloat(res.data.destination_amount),
        price: parseFloat(res.data.price),
      };
    }

    console.warn('[fetchQuote] Invalid response format:', res.data);
    return null; // Return null if the response does not match the expected format
  } catch (error) {
    console.error('[fetchQuote] Error fetching quote:', error);

    if (error.response) {
      console.error('[fetchQuote] API Error Response:', error.response.data);
    }

    throw error; // Re-throw the error to be handled upstream
  }
};

export interface IFiatQuoteResponse {
  asset: string;
  fiat: string;
  price: string;
}

export const fetchFiatQuote = async (
  asset: string,
  fiat: string
): Promise<number | null> => {
  try {
    const res = await api().get<IFiatQuoteResponse>('/quote', {
      params: { asset, fiat },
    });

    const price = parseFloat(res.data?.price);
    if (isNaN(price)) {
      console.warn(`[fetchFiatQuote] Invalid price for ${asset}/${fiat}:`, res.data?.price);
      return null;
    }

    return price;
  } catch (error) {
    console.error(`[fetchFiatQuote] Error fetching quote for ${asset}/${fiat}:`, error);
    return null;
  }
};
