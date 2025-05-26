import { Balance } from '@/services/emigro/types';

export const userBalance: Balance[] = [
  { balance: '10', assetType: 'credit_alphanum4', assetCode: 'BRZ', priceUSD: 5 },
  { balance: '30', assetType: 'credit_alphanum4', assetCode: 'USDC', priceUSD: 1 },
  { balance: '0', assetType: 'native', assetCode: 'EURC', priceUSD: 1.1 },
];
