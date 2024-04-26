import { action, makeAutoObservable, observable } from 'mobx';

import { IBalance } from '@/types/IBalance';

import { getUserBalance } from '@services/emigro/users';

export class BalanceStore {
  userBalance: IBalance[] = [];
  lastUpdate: number | null = null;

  constructor() {
    makeAutoObservable(this, {
      userBalance: observable,
      setUserBalance: action,
    });
  }

  setUserBalance(balance: IBalance[]): void {
    this.userBalance = balance;
    this.lastUpdate = Date.now();
  }

  find(assetCode: string): IBalance | undefined {
    return this.userBalance.find((balance) => balance.assetCode === assetCode);
  }

  get(assetCode: string): number {
    const found = this.find(assetCode);
    if (found) return Number(found.balance); //TODO: change the balance to number
    return 0;
  }

  async fetchUserBalance(): Promise<IBalance[]> {
    const interval = 10 * 1000;
    const now = Date.now();
    if (this.lastUpdate === null || now - this.lastUpdate >= interval) {
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
