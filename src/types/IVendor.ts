import { Payment } from './PixPayment';
import { CryptoAsset } from './assets';

export interface IVendor {
  name: string;
  address: string;
  publicKey: string;
  amount: number;
  assetCode: CryptoAsset;
}

export const vendorToPayment = (vendor: IVendor): Payment => {
  return {
    merchantName: vendor.name,
    merchantCity: vendor.address,
    transactionAmount: vendor.amount,
    pixKey: vendor.publicKey,
    assetCode: vendor.assetCode,
  };
};
