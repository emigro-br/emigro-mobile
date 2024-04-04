import { CryptoAsset } from './assets';

export interface Payment {
  merchantName: string;
  merchantCity: string;
  transactionAmount: number;
  assetCode: CryptoAsset; // TODO: should be CryptoOrFiat
  infoAdicional?: string;
  pixKey: string; // it is the vendor.publicKey on Emigro code
}

export interface PixPayment extends Payment {
  taxId: string; // receiver CPF/CNPJ
  bankName?: string;
  pixKey: string;
  txid: string; // transaction id
  fss?: string; // Facilitadora de Serviço de Saque (FSS)
  brCode: string; // FIXME: only to pass as paramenter to ReviewPixPayment
}
