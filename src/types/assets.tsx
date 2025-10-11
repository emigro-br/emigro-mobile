// Also control the allowed assets in the app
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
  // ARS = 'ARS', // Argentine Peso
  BRL = 'BRL', // Brazilian Real
  EUR = 'EUR', // Euro
  USD = 'USD', // United States Dollar
  GBP = 'GBP', // British Pounds
  // dev only
  // SRT = 'SRT', // SRT - fake currency
}

export type CryptoOrFiat = CryptoAsset | FiatCurrency;

type AssetType = 'crypto' | 'fiat';

export type Chain =
  | 'ethereum'
  | 'polygon'
  | 'solana'
  | 'base'
  | 'binance-smart-chain'
  | 'stellar'
  | undefined;

export class Asset {
  type: AssetType;
  code: string;
  name: string;
  symbol: string;
  icon: string;
  currency?: string;
  chain?: Chain;

  // From backend columns
  id: string;
  chainId: string;
  isDefault: boolean;
  isTransferoEnabled: boolean;
  isSwapable: boolean;
  isBridgeable: boolean;
  canBeGas: boolean;
  contractAddress?: string;
  decimals: number;
  isNative: boolean;
  isFiat: boolean;
  isEnabled?: boolean;
  isActive: boolean;
  bridgeConfig?: Record<string, any>;
  onrampSettings?: Record<string, any>;

  constructor(
    type: AssetType,
    code: string,
    name: string,
    symbol: string,
    currency: string | undefined,
    icon: string,
    chain?: Chain,
    backendData?: Partial<Omit<Asset, 'type' | 'code' | 'name' | 'symbol' | 'currency' | 'icon' | 'chain'>>
  ) {
    this.type = type;
    this.code = code;
    this.name = name;
    this.symbol = symbol;
    this.currency = currency;
    this.icon = icon;
    this.chain = chain;

    // Map backend fields
    this.id = backendData?.id ?? '';
    this.chainId = backendData?.chainId ?? '';
    this.isDefault = backendData?.isDefault ?? false;
    this.isTransferoEnabled = backendData?.isTransferoEnabled ?? false;
    this.isSwapable = backendData?.isSwapable ?? false;
    this.isBridgeable = backendData?.isBridgeable ?? false;
    this.canBeGas = backendData?.canBeGas ?? false;
    this.contractAddress = backendData?.contractAddress;
    this.decimals = backendData?.decimals ?? 0;
    this.isNative = backendData?.isNative ?? false;
    this.isFiat = backendData?.isFiat ?? false;
    this.isEnabled = backendData?.isEnabled;
    this.isActive = backendData?.isActive ?? true;
    this.bridgeConfig = backendData?.bridgeConfig;
	this.onrampSettings = (backendData as any)?.onrampSettings;
  }
}

// Function to return allowed crypto assets
export const cryptoAssets = () => {
  const allAssets = Object.values(CryptoAsset);
  const excludedAssets = __DEV__ ? [] : [CryptoAsset.SRT, CryptoAsset.XLM];
  return allAssets.filter((asset) => !excludedAssets.includes(asset));
};

// Function to return allowed fiat currencies
export const fiatCurrencies = () => {
  const allCurrencies = Object.values(FiatCurrency);
  const excludedCurrencies = __DEV__ ? [] : [FiatCurrency.SRT];
  return allCurrencies.filter((currency) => !excludedCurrencies.includes(currency));
};
