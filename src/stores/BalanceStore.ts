import { action, makeAutoObservable, observable } from 'mobx';

import { Balance } from '@/services/emigro/types';
import { getUserBalance } from '@/services/emigro/users';
import { CryptoAsset } from '@/types/assets';

export class BalanceStore {
  userBalance: Balance[] = [];
  lastUpdate: number | null = null;

  constructor() {
    makeAutoObservable(this, {
      userBalance: observable,
      setUserBalance: action,
    });
  }

  setUserBalance(balance: Balance[]): void {
    this.userBalance = balance;
    this.lastUpdate = Date.now();
  }

  find(assetCode: string): Balance | undefined {
    return this.userBalance.find((balance) => balance.assetCode === assetCode);
  }

  get(assetCode: string): number {
    const found = this.find(assetCode);
    if (found) return Number(found.balance); //TODO: change the balance to number
    return 0;
  }

  currentAssets(): CryptoAsset[] {
    return this.userBalance.map((balance) => {
      return CryptoAsset[balance.assetCode as keyof typeof CryptoAsset];
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
    }
    return this.userBalance;
  }
}

export const balanceStore = new BalanceStore();
