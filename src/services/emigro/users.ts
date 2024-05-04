import { CryptoAsset } from '@/types/assets';

import { api } from './api';
import { AuthSession, Balance, User, UserProfile } from './types';

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

export const addAssetToWallet = async (assetCode: CryptoAsset): Promise<Balance[]> => {
  const res = await api().post('/user/wallet/assets', { assetCode });
  return res.data.balances;
};

export const saveUserPreferences = async (preferences: Record<string, any>): Promise<Record<string, any>> => {
  const res = await api().post('/user/preferences', preferences);
  return res.data;
};
