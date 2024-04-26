import { Balance } from '@services/emigro/types';

export const userBalance: Balance[] = [
  { balance: '10', assetType: 'Asset Type 1', assetCode: 'BRL' },
  { balance: '30', assetType: 'Asset Type 2', assetCode: 'USDC' },
  { balance: '0', assetType: 'Asset Type 3', assetCode: 'EURC' },
];
