import { CryptoAsset } from './assets';

export const emigroCategoryCode = '9999';

export type Payment = {
  brCode: string;
  merchantName: string;
  merchantCity: string;
  transactionAmount: number;
  assetCode: CryptoAsset; // TODO: should be CryptoOrFiat
  infoAdicional?: string;
  walletKey?: string; // it is the vendor.publicKey on Emigro code
};

export type PixPayment = Payment & {
  pixKey: string;
  taxId: string; // receiver CPF/CNPJ
  bankName?: string;
  txid: string; // transaction id
  fss?: string; // Facilitadora de Serviço de Saque (FSS)
};
