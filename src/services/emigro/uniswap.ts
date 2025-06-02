// src/services/emigro/uniswap.tsx

import { api } from '@/services/emigro/api';
import { toBaseUnits } from '@/utils/token.utils';

export interface IUniswapQuoteRequest {
  fromAssetId: string;
  toAssetId: string;
  amount: string;          // already in base units!
  maxSlippageBps: string;  // e.g., "100" = 1%
}

export const fetchUniswapQuote = async (data: IUniswapQuoteRequest) => {
  const response = await api().post('/uniswap/quote', data); // ✅ NOTE: api() not api
  return response.data;
};
