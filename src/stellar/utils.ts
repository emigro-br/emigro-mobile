import { AssetCode } from '@constants/assetCode';

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
