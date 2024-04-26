import { IAuthSession } from '@/types/IAuthSession';
import { IBalance } from '@/types/IBalance';
import { IUserProfile } from '@/types/IUserProfile';
import { CryptoAsset } from '@/types/assets';

import { api } from './api';

export const getUserBalance = async (): Promise<IBalance[]> => {
  const res = await api().get('/user');
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

export const getUserPublicKey = async (): Promise<string> => {
  const res = await api().get('/user');
  return res.data.publicKey;
};

export const getUserProfile = async (session: IAuthSession): Promise<IUserProfile> => {
  const res = await api().post('/user/profile', session);
  return res.data;
};

export const addAssetToWallet = async (assetCode: CryptoAsset): Promise<IBalance[]> => {
  const res = await api().post('/user/wallet/assets', { assetCode });
  return res.data.balances;
};
