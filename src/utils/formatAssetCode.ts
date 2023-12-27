import { AssetCode } from '@constants/assetCode';

export const formatAssetCode = (assetCode: string): string => {
  switch (assetCode) {
    case AssetCode.USDC:
      return AssetCode.USD;
    case AssetCode.EURC:
      return AssetCode.EUR;
    default:
      return assetCode;
  }
};
