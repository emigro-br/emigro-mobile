import { CryptoAsset } from '@/types/assets';
import { sessionStore } from '@/stores/SessionStore';

import { api } from './api';
import { AuthSession, Balance, StellarAccount, User, UserProfile } from './types';

export const getUserBalance = async (): Promise<Balance[]> => {
  //console.log('[api][getUserBalance] 📡 Requesting user balances...');

  const res = await api().get('/user/wallet');
  const { balances } = res.data;

  console.log('[api][getUserBalance] ✅ Response:', balances);

  if (!balances) {
    console.error('[api][getUserBalance] ❌ No balances found in response');
    throw new Error('No balances found');
  }

  for (const balance of balances) {
    if (balance.assetType === 'native') {
      balance.assetCode = 'XLM';
    }
  }

  return balances;
};

export const getWalletBalances = async (walletId: string): Promise<Balance[]> => {
  const token = sessionStore.accessToken;
  const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

  //console.log('[api][getWalletBalances] 🔑 Access token:', token);
  console.log('[api][getWalletBalances] 🌍 API Base URL:', API_BASE_URL);
  console.log('[api][getWalletBalances] 📡 Requesting wallet balances for walletId:', walletId);

  if (!token || !API_BASE_URL) {
    console.error('[api][getWalletBalances] ❌ Missing token or base URL');
    throw new Error('Missing credentials');
  }

  const url = `${API_BASE_URL}/wallets/${walletId}/balances`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('[api][getWalletBalances] 📥 Raw response status:', res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[api][getWalletBalances] ❌ Failed with status ${res.status} | Body:`, errorText);
      throw new Error(`Failed to fetch wallet balances: ${res.status}`);
    }

    const json = await res.json();
    console.log('[api][getWalletBalances] ✅ Parsed response JSON:', json);

    return json;
  } catch (err) {
    console.error('[api][getWalletBalances] ❌ Exception caught:', err);
    return [];
  }
};

export const getUser = async (): Promise<User> => {
  const res = await api().get('/user');
  return res.data;
};

export const getUserProfile = async (session: AuthSession): Promise<UserProfile> => {
  const res = await api().post('/user/profile', session);
  return res.data;
};

export const createWallet = async (): Promise<StellarAccount> => {
  const timeout = 20 * 1000;
  const res = await api({ timeout }).post('/user/wallet');
  return res.data;
};

export const addAssetToWallet = async (assetCode: CryptoAsset): Promise<Balance[]> => {
  const res = await api().post('/user/wallet/assets', { assetCode });
  return res.data.balances;
};

export const saveUserPreferences = async (
  preferences: Record<string, any>
): Promise<Record<string, any>> => {
  const res = await api().post('/user/preferences', preferences);
  return res.data;
};

/**
 * Fetches the KYC status for a given user ID.
 * @param userId - The ID of the user to check KYC status for.
 * @returns An object containing the KYC status.
 */
export const checkKycStatus = async (
  userId: string
): Promise<{ kycVerified: boolean }> => {
  const res = await api().get(`/user/kyc/${userId}/status`);
  if (!res.data) {
    throw new Error('Failed to fetch KYC status');
  }
  return res.data;
};
