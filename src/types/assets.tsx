export enum CryptoAsset {
  // keep alphametical order
  ARS = 'ARS',
  BRL = 'BRL',
  EURC = 'EURC',
  USDC = 'USDC',
  XLM = 'XLM',
}

export enum FiatCurrency {
  ARS = 'ARS', // Argentine Peso
  BRL = 'BRL', // Brazilian Real
  EUR = 'EUR', // Euro
  USD = 'USD', // United States Dollar
}

export type CryptoOrFiat = CryptoAsset | FiatCurrency;

export const cryptoAssets = () => {
  const allAssets = Object.values(CryptoAsset);
  if (__DEV__) {
    return allAssets;
  }
  return allAssets.filter((asset) => asset !== CryptoAsset.XLM);
};

export const stableCoins = () => {
  return Object.values(CryptoAsset).filter((asset) => asset !== CryptoAsset.XLM);
};
