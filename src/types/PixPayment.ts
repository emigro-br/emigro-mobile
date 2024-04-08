import { CryptoAsset } from './assets';

export type Payment = {
  merchantName: string;
  merchantCity: string;
  transactionAmount: number;
  assetCode: CryptoAsset; // TODO: should be CryptoOrFiat
  infoAdicional?: string;
  pixKey: string; // it is the vendor.publicKey on Emigro code
};

export type PixPayment = Payment & {
  brCode: string;
  taxId: string; // receiver CPF/CNPJ
  bankName?: string;
  txid: string; // transaction id
  fss?: string; // Facilitadora de Serviço de Saque (FSS)
};
