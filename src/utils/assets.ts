// https://uxwing.com/
import argentineFlag from '@/assets/images/icons/argentina-flag-round-circle-icon.png';
import arsIcon from '@/assets/images/icons/ars-icon.png';
import brazilFlag from '@/assets/images/icons/brazil-flag-round-circle-icon.png';
// Digital assets
import brlIcon from '@/assets/images/icons/brl-icon.png';
import brzIcon from '@/assets/images/icons/brz-icon.png';
import eurcIcon from '@/assets/images/icons/eurc-icon.png';
import euroFlag from '@/assets/images/icons/european-union-flag-round-circle-icon.png';
import xlmIcon from '@/assets/images/icons/stellar-xlm-icon.png';
import usaFlag from '@/assets/images/icons/usa-flag-round-circle-icon.png';
import usdcIcon from '@/assets/images/icons/usdc-icon.png';
import { Asset, CryptoAsset, CryptoOrFiat, FiatCurrency } from '@/types/assets';

// TODO: fetch those data from the Emigro API
const cryptosData = [
  { type: 'crypto', code: 'XLM', name: 'Stellar Lumens', icon: xlmIcon, symbol: 'XLM' },
  { type: 'crypto', code: 'SRT', name: 'Stellar Reference Token', icon: xlmIcon, symbol: 'SRT' },
  { type: 'crypto', code: 'USDC', name: 'USD Coin', icon: usdcIcon, symbol: '$', currency: 'USD' },
  { type: 'crypto', code: 'EURC', name: 'EURo Coin', icon: eurcIcon, symbol: '€', currency: 'EUR' },
  { type: 'crypto', code: 'BRL', name: 'Brazilian Real', icon: brlIcon, symbol: 'R$', currency: 'BRL' },
  { type: 'crypto', code: 'BRZ', name: 'Brazilian Digital Token', icon: brzIcon, symbol: 'R$', currency: 'BRL' },
  { type: 'crypto', code: 'ARS', name: 'Peso Argentino Digital', icon: arsIcon, symbol: '$', currency: 'ARS' },
];

const fiatsData = [
  { type: 'fiat', code: FiatCurrency.ARS, name: 'Argentine Peso', icon: argentineFlag, symbol: '$' },
  { type: 'fiat', code: FiatCurrency.BRL, name: 'Brazilian Real', icon: brazilFlag, symbol: 'R$' },
  { type: 'fiat', code: FiatCurrency.EUR, name: 'Euro', icon: euroFlag, symbol: '€' },
  { type: 'fiat', code: FiatCurrency.USD, name: 'US Dollar', icon: usaFlag, symbol: '$' },
  { type: 'fiat', code: FiatCurrency.SRT, name: 'Stellar Reference Token', icon: xlmIcon, symbol: 'SRT' },
];

export const stablecoins = cryptosData.map(
  ({ type, code, name, icon, symbol, currency }) => new Asset(type, code, name, symbol, currency, icon),
);
export const currencies = fiatsData.map(
  ({ type, code, name, icon, symbol }) => new Asset(type, code, name, symbol, undefined, icon),
);

export const fiatByCode: Record<string, Asset> = currencies.reduce((acc, asset) => {
  return { ...acc, [asset.code]: asset };
}, {});

export const fiatByCrypto: Record<string, Asset> = stablecoins.reduce((acc, asset) => {
  return { ...acc, [asset.code]: asset.currency ? fiatByCode[asset.currency] : undefined };
}, {});

export const allCryptoCodesToObjs = (cryptos: CryptoAsset[]): Asset[] => {
  return cryptos.map((crypto) => cryptoCodeToObj(crypto)).filter((a) => a !== undefined) as Asset[];
};
export const cryptoCodeToObj = (asset: CryptoAsset): Asset => cryptosData.find((a) => a.code === asset) as Asset;
export const fiatCodeToObj = (asset: FiatCurrency): Asset => currencies.find((a) => a.code === asset) as Asset;

export const fiatsFromCryptoCodes = (cryptos: CryptoAsset[]): Asset[] => {
  return cryptos.map((crypto) => fiatByCrypto[crypto]).filter((a) => a !== undefined) as Asset[]; // filter out undefined, XLM has no fiat
};

// convert asset code to currency code
export const AssetToCurrency = {
  [CryptoAsset.XLM]: null,
  [CryptoAsset.SRT]: FiatCurrency.SRT,
  [CryptoAsset.USDC]: FiatCurrency.USD,
  [CryptoAsset.EURC]: FiatCurrency.EUR,
  [CryptoAsset.BRL]: FiatCurrency.BRL,
  [CryptoAsset.BRZ]: FiatCurrency.BRL,
  [CryptoAsset.ARS]: FiatCurrency.ARS,
};

export const CurrencyToAsset = {
  [FiatCurrency.EUR]: CryptoAsset.EURC,
  [FiatCurrency.USD]: CryptoAsset.USDC,
  [FiatCurrency.BRL]: CryptoAsset.BRL,
  [FiatCurrency.ARS]: CryptoAsset.ARS,
  [FiatCurrency.SRT]: CryptoAsset.SRT,
};

// FIXME: used by some place that should be refactored
export const AssetToSymbol = {
  [CryptoAsset.XLM]: 'XLM',
  [CryptoAsset.SRT]: 'SRT',
  [CryptoAsset.USDC]: '$',
  [CryptoAsset.EURC]: '€',
  [CryptoAsset.BRZ]: 'R$',

  // currencies
  [FiatCurrency.EUR]: '€',
  [FiatCurrency.USD]: '$',
  [FiatCurrency.BRL]: 'R$',
  [FiatCurrency.ARS]: '$',
};

// https://en.wikipedia.org/wiki/ISO_4217
export const fiatToIso = {
  XLM: '000', // non oficial
  [FiatCurrency.EUR]: '978',
  [FiatCurrency.USD]: '840',
  [FiatCurrency.BRL]: '986',
  [FiatCurrency.ARS]: '032',
};

export const isoToFiat = {
  '000': null,
  '978': FiatCurrency.EUR,
  '840': FiatCurrency.USD,
  '986': FiatCurrency.BRL,
  '032': FiatCurrency.ARS,
};

export const isoToCrypto = {
  '000': CryptoAsset.XLM,
  '978': CryptoAsset.EURC,
  '840': CryptoAsset.USDC,
  '986': CryptoAsset.BRZ,
  '032': CryptoAsset.ARS,
};

const allAssets = [...stablecoins, ...currencies];

export const labelFor = (asset: CryptoOrFiat, type?: string): string | undefined => {
  if (type === 'fiat') {
    return labelForFiat(asset as FiatCurrency);
  }
  const assetObj = allAssets.find((a) => a.code === asset);
  return assetObj?.name ?? asset;
};

export const labelForFiat = (asset: FiatCurrency): string => {
  const assetObj = currencies.find((a) => a.code === asset);
  return assetObj?.name || asset;
};

export const symbolFor = (asset: CryptoOrFiat, value: number = 0) => {
  const assetObj = allAssets.find((a) => a.code === asset);
  if (assetObj) {
    return `${assetObj.symbol} ${Number(value).toFixed(2)}`;
  }
  return `${value.toFixed(2)} ${asset}`;
};

export const iconFor = (asset: CryptoOrFiat, type?: string) => {
  if (type === 'fiat') {
    const assetObj = currencies.find((a) => a.code === asset);
    return assetObj?.icon;
  }
  const assetObj = allAssets.find((a) => a.code === asset);
  return assetObj?.icon;
};
