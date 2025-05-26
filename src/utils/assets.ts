import { Asset, CryptoAsset, CryptoOrFiat, Chain } from '@/types/assets';

import baseIcon from '@/assets/images/chains/base.png';
import stellarIcon from '@/assets/images/chains/stellar.png';

import ethereumIcon from '@/assets/images/icons/ethereum.png';
import usdcIcon from '@/assets/images/icons/usdc-icon.png';
import eurcIcon from '@/assets/images/icons/eurc-icon.png';
import brzIcon from '@/assets/images/icons/brz-icon.png';
import arsIcon from '@/assets/images/icons/ars-icon.png';
import xlmIcon from '@/assets/images/icons/stellar-xlm-icon.png';

import brlIcon from '@/assets/images/icons/brl-icon.png';
import usdIcon from '@/assets/images/icons/usa-icon.png';
import eurIcon from '@/assets/images/icons/eur-icon.png';
import gbpIcon from '@/assets/images/icons/gbp-icon.png';

// 🔧 Asset icons
export const assetIconMap: Record<string, any> = {
  // Crypto
  ethereum: ethereumIcon,
  eth: ethereumIcon,
  usdc: usdcIcon,
  eurc: eurcIcon,
  brz: brzIcon,
  ars: arsIcon,
  xlm: xlmIcon,

  // Fiat
  brl: brlIcon,
  usd: usdIcon,
  eur: eurIcon,
  gbp: gbpIcon,
};

// ✅ Currency symbol map
const currencySymbolMap: Record<string, string> = {
  USD: '$',
  BRL: 'R$',
  EUR: '€',
  GBP: '£',
  ARS: 'ARS',
};

export const iconFor = (
  asset: CryptoOrFiat | { iconUrl?: string; code?: string; symbol?: string }
) => {
  const key =
    typeof asset === 'string'
      ? asset.toLowerCase()
      : asset.iconUrl?.replace('.png', '').toLowerCase() ||
        asset.code?.toLowerCase() ||
        asset.symbol?.toLowerCase();

  if (key && assetIconMap[key]) {
    return assetIconMap[key];
  }

  console.warn(`[iconFor] ❌ Icon not found for: ${key}`);
  return undefined;
};

export const labelFor = (asset: CryptoOrFiat | { name?: string; code?: string }) => {
  if (!asset) {
    console.warn('[labelFor] ❌ Asset is undefined');
    return 'Unknown';
  }

  if (typeof asset === 'string') {
    const nameMap: Record<string, string> = {
      ars: 'Argentine Peso',
      brl: 'Brazilian Real',
      usd: 'US Dollar',
      eur: 'Euro',
      gbp: 'British Pound',
    };
    return nameMap[asset.toLowerCase()] ?? asset.toUpperCase();
  }

  return asset.name ?? asset.code ?? 'Unknown';
};

const chainIconMap: Record<string, any> = {
  base: baseIcon,
  stellar: stellarIcon,
  '05c5b96c-291c-11f0-8f36-02ee245cdcb3': ethereumIcon, // 👈 Add Sepolia chain ID
};

export const chainIconFor = (chain?: Chain) => {
  if (!chain) return undefined;
  return chainIconMap[chain];
};

export const truncateToTwoDecimals = (value: number): string => {
  const truncated = Math.trunc(value * 100) / 100;
  return truncated.toFixed(2);
};

// ✅ Proper formatting with currency symbols
export const symbolFor = (
  asset: CryptoOrFiat | { symbol?: string; code?: string },
  value: number = 0
): string => {
  const code = typeof asset === 'string' ? asset : asset.symbol ?? asset.code ?? 'USD';
  const upperCode = code.toUpperCase();
  const symbol = currencySymbolMap[upperCode] ?? upperCode;

  return `${symbol} ${truncateToTwoDecimals(value)}`;
};

// ✅ MAP ISO CURRENCY CODES TO CRYPTO ASSETS
export const isoToCrypto: Record<string, CryptoAsset> = {
  '986': CryptoAsset.BRZ,   // BRL → BRZ
  '840': CryptoAsset.USDC,  // USD → USDC
  '978': CryptoAsset.EURC,  // EUR → EURC
  '032': CryptoAsset.ARS,   // ARS → ARS
};
