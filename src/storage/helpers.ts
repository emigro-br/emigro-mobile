import AsyncStorage from '@react-native-async-storage/async-storage';

import { AssetCode } from '@constants/assetCode';

export const getAccessToken = async (): Promise<string | null> => {
  const session = await AsyncStorage.getItem('session');
  const { accessToken } = session ? JSON.parse(session) : null;
  return accessToken;
};

export const assetCodes = {
  [AssetCode.USD]: AssetCode.USDC,
  [AssetCode.EUR]: AssetCode.EURC,
  [AssetCode.USDC]: AssetCode.USDC,
  [AssetCode.EURC]: AssetCode.EURC,
  [AssetCode.BRL]: AssetCode.BRL,
};

export const getAssetCode = (assetCode: AssetCode) => {
  return assetCodes[assetCode] || assetCode;
};
