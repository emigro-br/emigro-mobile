import { AssetCode } from '@constants/assetCode';

export const assetCodes = {
  [AssetCode.USD]: AssetCode.USDC,
  [AssetCode.EUR]: AssetCode.EURC,
  [AssetCode.USDC]: AssetCode.USDC,
  [AssetCode.EURC]: AssetCode.EURC,
  [AssetCode.BRL]: AssetCode.BRL,
  [AssetCode.ARS]: AssetCode.ARS,
};

export const getAssetCode = (assetCode: AssetCode): AssetCode => {
  return assetCodes[assetCode] || assetCode;
};
