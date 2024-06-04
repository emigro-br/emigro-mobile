export enum CryptoAsset {
  // keep alphametical order
  ARS = 'ARS',
  BRL = 'BRL',
  EURC = 'EURC',
  USDC = 'USDC',
  XLM = 'XLM',
  SRT = 'SRT',
}

export enum FiatCurrency {
  ARS = 'ARS', // Argentine Peso
  BRL = 'BRL', // Brazilian Real
  EUR = 'EUR', // Euro
  USD = 'USD', // United States Dollar
  SRT = 'SRT', // SRT - fake currency
}

export type CryptoOrFiat = CryptoAsset | FiatCurrency;

type AssetType = 'crypto' | 'fiat';

export class Asset {
  type: AssetType;
  code: string;
  name: string;
  symbol: string;
  icon: string;
  currency?: string;

  constructor(type: string, code: string, name: string, symbol: string, currency: string | undefined, icon: string) {
    this.type = type as AssetType;
    this.code = code;
    this.name = name;
    this.symbol = symbol;
    this.currency = currency;
    this.icon = icon;
  }
}

export const cryptoAssets = () => {
  const allAssets = Object.values(CryptoAsset);
  if (__DEV__) {
    return allAssets;
  }
  return allAssets.filter((asset) => asset !== CryptoAsset.XLM && asset !== CryptoAsset.SRT);
};
