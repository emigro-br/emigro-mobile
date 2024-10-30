// also control the allowed assets in the app
export enum CryptoAsset {
  ARS = 'ARS',
  BRZ = 'BRZ',
  EURC = 'EURC',
  USDC = 'USDC',
  // dev only
  SRT = 'SRT',
  XLM = 'XLM',
}

export enum FiatCurrency {
  ARS = 'ARS', // Argentine Peso
  BRL = 'BRL', // Brazilian Real
  EUR = 'EUR', // Euro
  USD = 'USD', // United States Dollar
  // dev only
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
  const excludedAssets = __DEV__ ? [] : [CryptoAsset.SRT, CryptoAsset.XLM];
  return allAssets.filter((asset) => !excludedAssets.includes(asset));
};

export const fiatCurrencies = () => {
  const allCurrencies = Object.values(FiatCurrency);
  const excludedCurrencies = __DEV__ ? [] : [FiatCurrency.SRT];
  return allCurrencies.filter((currency) => !excludedCurrencies.includes(currency));
};
