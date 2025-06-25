import { action, makeAutoObservable, observable, runInAction } from 'mobx';

import { Balance } from '@/services/emigro/types';
import { getUserBalance, getWalletBalances } from '@/services/emigro/users';
import { CryptoAsset } from '@/types/assets';

export class BalanceStore {
  userBalance: Balance[] = [];
  totalBalance: number = 0;
  lastUpdate: number | null = null;

  walletBalances: Record<string, Balance[]> = {};
  walletLastUpdate: Record<string, number> = {};

  constructor() {
    makeAutoObservable(this, {
      userBalance: observable,
      totalBalance: observable,
      walletBalances: observable,
      setUserBalance: action,
      setTotalBalance: action,
      setWalletBalances: action,
    });
  }

  setUserBalance(balance: Balance[]): void {
    console.log('[store][BalanceStore] setUserBalance - input:', balance);
    this.userBalance = balance;
    this.lastUpdate = Date.now();
  }

  setTotalBalance(total: number): void {
    console.log('[store][BalanceStore] setTotalBalance - input:', total);
    this.totalBalance = total;
  }

  setWalletBalances(walletId: string, balances: Balance[]): void {
    console.log('[store][BalanceStore] setWalletBalances - walletId:', walletId, 'balances:', balances);
    this.walletBalances[walletId] = balances;
    this.walletLastUpdate[walletId] = Date.now();
  }

  find(assetCode: CryptoAsset): Balance | undefined {
    return this.userBalance.find((balance) => balance.assetCode === assetCode);
  }

  get(assetCode: CryptoAsset): number {
    const found = this.find(assetCode);
    return found ? Number(found.balance) : 0;
  }

  currentAssets(): CryptoAsset[] {
    return this.userBalance
      .map((balance) => CryptoAsset[balance.assetCode as keyof typeof CryptoAsset])
      .filter((asset) => asset !== undefined);
  }

  async fetchUserBalance({
    interval = 10 * 1000,
    force = false,
  }: {
    force?: boolean;
    interval?: number;
  } = {}): Promise<Balance[]> {
    const now = Date.now();
    if (force || this.lastUpdate === null || now - this.lastUpdate >= interval) {
      console.log('[store][BalanceStore] fetchUserBalance - fetching (force:', force, ')');
      const balances = await getUserBalance();
      console.log('[store][BalanceStore] fetchUserBalance - response:', balances);

      if (balances) {
        runInAction(() => {
          this.setUserBalance(balances);
          const total = balances.reduce((acc, balance) => acc + balance.priceUSD, 0);
          this.setTotalBalance(total);
        });
      }
    } else {
      console.log('[store][BalanceStore] fetchUserBalance - using cached data');
    }

    return this.userBalance;
  }

  async fetchWalletBalance(
    walletId: string,
    {
      interval = 10 * 1000,
      force = false,
    }: {
      force?: boolean;
      interval?: number;
    } = {}
  ): Promise<Balance[]> {
    const now = Date.now();
    const lastFetched = this.walletLastUpdate[walletId];

    if (force || lastFetched === undefined || now - lastFetched >= interval) {
      console.log('[store][BalanceStore] fetchWalletBalance - fetching for walletId:', walletId, '| force:', force);

      const balances = await getWalletBalances(walletId);

      console.log('[store][BalanceStore] fetchWalletBalance - response for walletId:', walletId, '| balances:', balances);

      if (balances) {
        runInAction(() => {
          this.setWalletBalances(walletId, balances);
        });
      } else {
        console.warn('[store][BalanceStore] fetchWalletBalance - NO balances returned for walletId:', walletId);
      }
    } else {
      console.log('[store][BalanceStore] fetchWalletBalance - using cached data for walletId:', walletId);
    }

    return this.walletBalances[walletId] || [];
  }
}

export const balanceStore = new BalanceStore();
