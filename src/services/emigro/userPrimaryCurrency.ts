// src/services/emigro/userPrimaryCurrency.ts

import { api } from './api';

interface PrimaryCurrencyResponse {
  chainId: string;
  assetId: string;
  chainIdOnchain: number;
}

// Check if the user already has a primary currency
export const fetchPrimaryCurrency = async (): Promise<PrimaryCurrencyResponse | null> => {
  try {
    const res = await api().get('/user/primary-currency');
    const data = res.data;

    // Validate expected structure
    if (
      typeof data === 'object' &&
      data !== null &&
      typeof data.assetId === 'string' &&
      typeof data.chainId === 'string' &&
      typeof data.chainIdOnchain === 'number'
    ) {
      console.log('[userPrimaryCurrency] ✅ Fetched primary currency:', data);
      return data;
    }

    console.warn('[userPrimaryCurrency] ⚠️ Invalid primary currency structure:', data);
    return null;

  } catch (err) {
    console.warn('[userPrimaryCurrency] ❌ Failed to fetch primary currency:', err);
    return null;
  }
};

// Set the default primary currency
export const setDefaultPrimaryCurrency = async (): Promise<PrimaryCurrencyResponse | null> => {
  const payload = {
    chainId: '05c65d14-291c-11f0-8f36-02ee245cdcb3',
    assetId: '1e90df0a-2920-11f0-8f36-02ee245cdcb3',
    chainIdOnchain: 8453,
  };

  try {
    await api().post('/user/primary-currency', payload);
    console.log('[userPrimaryCurrency] ✅ Default primary currency set:', payload);
    return payload;
  } catch (err) {
    console.error('[userPrimaryCurrency] ❌ Failed to set default primary currency:', err);
    return null;
  }
};

// Ensure user has a primary currency, set default if missing
export const ensurePrimaryCurrencyExists = async (): Promise<PrimaryCurrencyResponse | null> => {
  const current = await fetchPrimaryCurrency();

  if (!current) {
    console.log('[userPrimaryCurrency] ℹ️ No primary currency found — setting default...');
    return await setDefaultPrimaryCurrency();
  } else {
    console.log('[userPrimaryCurrency] ✅ Primary currency already set:', current);
    return current;
  }
};

// Set a specific primary currency
export const updatePrimaryCurrency = async (assetId: string, chainId: string, chainIdOnchain: number) => {
  const payload = { assetId, chainId, chainIdOnchain };
  try {
    await api().post('/user/primary-currency', payload);
    console.log('[userPrimaryCurrency] ✅ Updated primary currency:', payload);
    return true;
  } catch (err) {
    console.error('[userPrimaryCurrency] ❌ Failed to update primary currency:', err);
    return false;
  }
};
