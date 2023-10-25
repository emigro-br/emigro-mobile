import { IFilteredBalance } from './IFilteredBalance';

export interface IBalance extends IFilteredBalance {
  assetType: string;
  assetCode: string;
}
