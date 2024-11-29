import { CryptoAsset } from '@/types/assets';

import { api } from './api';
import { AuthSession, Balance, StellarAccount, User, UserProfile } from './types';

export const getUserBalance = async (): Promise<Balance[]> => {
  const res = await api().get('/user/wallet');
  const { balances } = res.data;
  if (!balances) {
    throw new Error('No balances found');
  }
  // workaround for the backend not returning the assetCode for native
  for (const balance of balances) {
    if (balance.assetType === 'native') {
      balance.assetCode = 'XLM';
    }
  }
  return balances;
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

export const saveUserPreferences = async (preferences: Record<string, any>): Promise<Record<string, any>> => {
  const res = await api().post('/user/preferences', preferences);
  return res.data;
};

/**
 * Fetches the KYC status for a given user ID.
 * @param userId - The ID of the user to check KYC status for.
 * @returns An object containing the KYC status.
 */
export const checkKycStatus = async (userId: string): Promise<{ kycVerified: boolean }> => {
  const res = await api().get(`/user/kyc-status/${userId}`);
  if (!res.data) {
    throw new Error('Failed to fetch KYC status');
  }
  return res.data;
};
