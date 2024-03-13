export enum CryptoAsset {
  XLM = 'XLM',
  USDC = 'USDC',
  EURC = 'EURC',
  BRL = 'BRL',
  ARS = 'ARS',
}

export enum FiatCurrency {
  USD = 'USD', // United States Dollar
  EUR = 'EUR', // Euro
  BRL = 'BRL', // Brazilian Real
  ARS = 'ARS', // Argentine Peso
}

export type CryptoOrFiat = CryptoAsset | FiatCurrency;

export function cryptoAssets() {
  const allAssets = Object.values(CryptoAsset);
  if (__DEV__) {
    return allAssets;
  }
  return allAssets.filter((asset) => asset !== CryptoAsset.XLM);
}
