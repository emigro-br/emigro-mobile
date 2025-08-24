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

/* -------------------- NEW: Fiat-path quote (e.g., BRL → USDC with amount) -------------------- */

export interface IFiatPathQuoteRequest {
  from: string;             // e.g. 'BRL'
  to: string;               // e.g. 'USDC'
  amount: string | number;  // human amount in 'from' fiat
  type?: 'strict_send' | 'strict_receive';
}

export interface IFiatPathQuoteResponse {
  source?: string;
  rate?: string | number;
  destination_amount: string; // amount of 'to' asset in human units
}

/**
 * Returns an object containing destination_amount for fiat → crypto path.
 * Example:
 *   const { destination_amount } = await fetchFiatPathQuote({ from:'BRL', to:'USDC', amount:'123.45', type:'strict_send' });
 */
export const fetchFiatPathQuote = async (
  req: IFiatPathQuoteRequest
): Promise<IFiatPathQuoteResponse> => {
  const payload = {
    from: req.from,
    to: req.to,
    amount: typeof req.amount === 'number' ? req.amount.toFixed(2) : req.amount,
    type: req.type ?? 'strict_send',
  };

  console.log('[fetchFiatPathQuote] 📤 POST /fiat/quote:', payload);

  const res = await api().post<IFiatPathQuoteResponse>('/fiat/quote', payload);
  const body = res.data;

  if (!body || body.destination_amount == null) {
    throw new Error('Malformed fiat quote response (missing destination_amount)');
  }

  return body;
};

// Direct fiat pair price: price of 1 <asset> in <fiat>, via GET /quote?asset=&fiat=
export const fetchDirectFiatPairQuote = async (
  asset: string, // e.g. 'USDC'
  fiat: string   // e.g. 'BRL'
): Promise<number> => {
  if (!asset || !fiat) {
    throw new Error(`[fetchDirectFiatPairQuote] Missing asset or fiat. Got asset="${asset}", fiat="${fiat}"`);
  }

  const res = await api().get<IFiatQuoteResponse>('/quote', {
    params: { asset, fiat },
  });

  const price = parseFloat(res.data?.price);
  if (Number.isNaN(price) || price <= 0) {
    throw new Error(`[fetchDirectFiatPairQuote] Invalid price for ${asset}/${fiat}: ${res.data?.price}`);
  }
  return price; // price of 1 unit of asset in fiat
};

/* -------------------- Existing simple asset/fiat price lookup (unchanged) -------------------- */

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
