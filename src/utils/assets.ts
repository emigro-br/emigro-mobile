import { CryptoAsset, CryptoOrFiat, FiatCurrency } from '@/types/assets';

// https://uxwing.com/
import arsIcon from '@assets/images/icons/argentina-flag-round-circle-icon.png';
import brlIcon from '@assets/images/icons/brazil-flag-round-circle-icon.png';
import eurIcon from '@assets/images/icons/european-union-flag-round-circle-icon.png';
import xlmIcon from '@assets/images/icons/stellar-xlm-icon.png';
import usdIcon from '@assets/images/icons/usa-flag-round-circle-icon.png';

// convert asset code to currency code
export const AssetToCurrency = {
  [CryptoAsset.XLM]: null,
  [CryptoAsset.USDC]: FiatCurrency.USD,
  [CryptoAsset.EURC]: FiatCurrency.EUR,
  [CryptoAsset.BRL]: FiatCurrency.BRL,
  [CryptoAsset.ARS]: FiatCurrency.ARS,
};

const AssetToName = {
  [CryptoAsset.XLM]: 'Stellar Lumens',
  [CryptoAsset.USDC]: 'USD Coin',
  [CryptoAsset.EURC]: 'Euro Coin',
  [CryptoAsset.BRL]: 'Brazilian Real Coin',
  [CryptoAsset.ARS]: 'Argentine Peso Coin',
};

export const CurrencyToAsset = {
  [FiatCurrency.EUR]: CryptoAsset.EURC,
  [FiatCurrency.USD]: CryptoAsset.USDC,
  [FiatCurrency.BRL]: CryptoAsset.BRL,
  [FiatCurrency.ARS]: CryptoAsset.ARS,
};

const FiatToName = {
  [FiatCurrency.EUR]: 'Euro',
  [FiatCurrency.USD]: 'US Dollar',
  [FiatCurrency.BRL]: 'Brazilian Real',
  [FiatCurrency.ARS]: 'Argentine Peso',
};

export const labelFor = (asset: CryptoOrFiat): string | undefined => {
  // FIXME: Fiat is prioritized over Crypto due name collision
  if (asset in FiatCurrency) {
    return FiatToName[asset as FiatCurrency];
  } else if (asset in CryptoAsset) {
    return AssetToName[asset as CryptoAsset];
  }
};

export const AssetToSymbol = {
  [CryptoAsset.XLM]: 'XLM',
  [CryptoAsset.USDC]: '$',
  [CryptoAsset.EURC]: '€',

  // currencies
  [FiatCurrency.EUR]: '€',
  [FiatCurrency.USD]: '$',
  [FiatCurrency.BRL]: 'R$',
  [FiatCurrency.ARS]: '$',
};

export const symbolFor = (asset: CryptoOrFiat, value: number = 0) =>
  `${AssetToSymbol[asset]} ${Number(value).toFixed(2)}`;

const AssetToIcon: Record<CryptoOrFiat, any> = {
  [CryptoAsset.EURC]: eurIcon,
  [CryptoAsset.USDC]: usdIcon,
  [CryptoAsset.ARS]: arsIcon,
  [CryptoAsset.BRL]: brlIcon,
  [CryptoAsset.XLM]: xlmIcon,

  [FiatCurrency.EUR]: eurIcon,
  [FiatCurrency.USD]: usdIcon,
  // [FiatCurrencies.BRL]: brlIcon,
  // [FiatCurrencies.ARS]: arsIcon,
};

export const iconFor = (asset: CryptoOrFiat) => {
  return AssetToIcon[asset];
};

// https://en.wikipedia.org/wiki/ISO_4217
export const fiatToIso = {
  XLM: '000', // non oficial
  [FiatCurrency.EUR]: '978',
  [FiatCurrency.USD]: '840',
  [FiatCurrency.BRL]: '986',
  [FiatCurrency.ARS]: '032',
};

export const isoToCrypto = {
  '000': CryptoAsset.XLM,
  '978': CryptoAsset.EURC,
  '840': CryptoAsset.USDC,
  '986': CryptoAsset.BRL,
  '032': CryptoAsset.ARS,
};
