import { action, makeAutoObservable, observable } from 'mobx';

import { Balance } from '@/services/emigro/types';
import { getUserBalance } from '@/services/emigro/users';
import { CryptoAsset } from '@/types/assets';

export class BalanceStore {
  userBalance: Balance[] = [];
  lastUpdate: number | null = null;
  totalBalance: number = 0;

  constructor() {
    makeAutoObservable(this, {
      userBalance: observable,
      setUserBalance: action,
      // total balance
      totalBalance: observable,
      setTotalBalance: action,
    });
  }

  setUserBalance(balance: Balance[]): void {
    this.userBalance = balance;
    this.lastUpdate = Date.now();
  }

  setTotalBalance(total: number): void {
    this.totalBalance = total;
  }

  find(assetCode: CryptoAsset): Balance | undefined {
    return this.userBalance.find((balance) => balance.assetCode === assetCode);
  }

  get(assetCode: CryptoAsset): number {
    const found = this.find(assetCode);
    if (found) return Number(found.balance); //TODO: change the balance to number
    return 0;
  }

  currentAssets(): CryptoAsset[] {
    return this.userBalance.map((balance) => {
      return balance.assetCode as CryptoAsset;
    });
  }

  async fetchUserBalance({
    interval = 10 * 1000, // 10 seconds
    force = false,
  }: {
    force?: boolean;
    interval?: number;
  } = {}): Promise<Balance[]> {
    const now = Date.now();
    if (force || this.lastUpdate === null || now - this.lastUpdate >= interval) {
      console.debug('Fetching user balance...');
      const balances = await getUserBalance();
      if (balances) {
        this.setUserBalance(balances);
      }
      // update total balance
      const total = balances.reduce((acc, balance) => {
        return acc + Number(balance.balance);
      }, 0);
      this.setTotalBalance(total);
    }
    return this.userBalance;
  }
}

export const balanceStore = new BalanceStore();
