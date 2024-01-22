export enum AssetCode {
  USDC = 'USDC',
  EURC = 'EURC',
  EUR = 'EUR',
  USD = 'USD',
  BRL = 'BRL',
  ARS = 'ARS',
}

// TODO: check formatAssetCode() function
export const AssetCodeToName = {
  [AssetCode.USDC]: 'USD Coin',
  [AssetCode.EURC]: 'Euro Coin',
  [AssetCode.EUR]: 'Euro',
  [AssetCode.USD]: 'US Dollar',
  [AssetCode.BRL]: 'Brazilian Real',
  [AssetCode.ARS]: 'Argentine Peso',
};

export const AssetCodeToSymbol = {
  [AssetCode.USDC]: '$',
  [AssetCode.EURC]: '€',
  [AssetCode.EUR]: '€',
  [AssetCode.USD]: '$',
  [AssetCode.BRL]: 'R$',
  [AssetCode.ARS]: '$',
};
