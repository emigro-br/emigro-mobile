import { CryptoAsset, FiatCurrency } from '@/types/assets';

// https://uxwing.com/
import arsIcon from '@assets/images/icons/argentina-flag-round-circle-icon.png';
import brlIcon from '@assets/images/icons/brazil-flag-round-circle-icon.png';
import eurIcon from '@assets/images/icons/european-union-flag-round-circle-icon.png';
import usdIcon from '@assets/images/icons/usa-flag-round-circle-icon.png';
import xlmIcon from '@assets/images/icons/stellar-xlm-icon.png';

// convert asset code to currency code
export const AssetToCurrency = {
  [CryptoAsset.XLM]: 'XLM',
  [CryptoAsset.USDC]: FiatCurrency.USD,
  [CryptoAsset.EURC]: FiatCurrency.EUR,
  [CryptoAsset.BRL]: FiatCurrency.BRL,
  [CryptoAsset.ARS]: FiatCurrency.ARS,
};

export const AssetToName = {
  [CryptoAsset.XLM]: 'Stellar Lumens',
  [CryptoAsset.USDC]: 'USD Coin',
  [CryptoAsset.EURC]: 'Euro Coin',
  [FiatCurrency.EUR]: 'Euro',
  [FiatCurrency.USD]: 'US Dollar',
  [FiatCurrency.BRL]: 'Brazilian Real',
  [FiatCurrency.ARS]: 'Argentine Peso',
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

const AssetToIcon: Record<CryptoAsset | FiatCurrency, any> = {
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

export const iconFor = (asset: CryptoAsset | FiatCurrency) => {
  return AssetToIcon[asset];
};
