import { api } from './api';

export interface INewQuoteRequest {
  fromTokenAddress: string;
  toTokenAddress: string;
  amount: string; // human-readable
  chainId: number;
  slippage?: number;
}

export interface INewQuoteResponse {
  fromTokenAddress: string;
  toTokenAddress: string;
  chainId: number;
  inputAmount: string;

  estimatedAmount: string;
  feeAmount: string;
  slippagePercent: string;
  routeAllowed: boolean;

  routerType: string;
  feeTier?: number;
  source?: string;
  priceImpactPercent?: string;

  fromTokenDecimals: number;
  toTokenDecimals: number;

  humanAmountOut: string;
  amountOut: string;

  rawQuote: string;
  humanRawQuote: string;

  amountIn: string;
  humanAmountIn: string;

  minAmountIn: string;
  humanMinAmountIn: string;

  emigroFeeAmount: string;
  emigroFeePercent: string;

  liquidityPoolFeePercent: string;
}


export const fetchQuote = async (
  data: INewQuoteRequest
): Promise<INewQuoteResponse | null> => {
  try {
    const payload = {
      ...data,
      slippage: data.slippage ?? 0.75,
    };

    console.log('[fetchQuote] 📤 Sending POST to /emigroswap/quote with:', payload);

    const response = await api().post<INewQuoteResponse>('/emigroswap/quote', payload);

    const quote = response.data;

	if (!quote) {
	  console.warn('[fetchQuote] 🚫 Quote invalid:', quote);
	  return null;
	}

    console.log('[fetchQuote] ✅ Received quote:', quote);
    return quote;
  } catch (error: any) {
    console.error('[fetchQuote] ❌ Error fetching quote from new endpoint:', error);
    if (error.response) {
      console.error('[fetchQuote] API Error Response:', error.response.data);
    }
    throw error;
  }
};

// ✅ Fiat Quote Function (unchanged)
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
