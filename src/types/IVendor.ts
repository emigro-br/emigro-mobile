import { CryptoAsset } from './assets';

export interface IVendor {
  name: string;
  address: string;
  publicKey: string;
  amount: number;
  assetCode: CryptoAsset;
}
