import { Balance } from '@/services/emigro/types';

export const userBalance: Balance[] = [
  { balance: '10', assetType: 'Asset Type 1', assetCode: 'BRZ', priceUSD: 5 },
  { balance: '30', assetType: 'Asset Type 2', assetCode: 'USDC', priceUSD: 1 },
  { balance: '0', assetType: 'Asset Type 3', assetCode: 'EURC', priceUSD: 1.1 },
];
