import { action, makeAutoObservable, observable, runInAction } from 'mobx';

import { Balance } from '@/services/emigro/types';
import { getUserBalance, getWalletBalances } from '@/services/emigro/users';
import { CryptoAsset } from '@/types/assets';
import { sessionStore } from '@/stores/SessionStore';
import { fetchFiatQuote } from '@/services/emigro/quotes';

export class BalanceStore {
  userBalance: Balance[] = [];
  totalBalance: number | null = null;
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

  setTotalBalance(total: number | null): void {
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
    // Recompute "userBalance" and "totalBalance" by aggregating ALL wallets.
    const now = Date.now();
    if (!(force || this.lastUpdate === null || now - this.lastUpdate >= interval)) {
      console.log('[store][BalanceStore] fetchUserBalance - using cached aggregated data');
      return this.userBalance;
    }

    console.log('[store][BalanceStore] fetchUserBalance (AGGREGATED) - fetching from all wallets');
    const wallets = sessionStore.user?.wallets ?? [];
    const bankCurrency = sessionStore.preferences?.fiatsWithBank?.[0] ?? 'USD';

    // 1) fetch balances per wallet and keep store.walletBalances updated
    const perWalletBalances: Balance[][] = [];
    for (const w of wallets) {
      try {
        const b = await getWalletBalances(w.id);
        runInAction(() => {
          this.setWalletBalances(w.id, b ?? []);
        });
        perWalletBalances.push(b ?? []);
      } catch (e) {
        console.warn('[store][BalanceStore] fetchUserBalance - wallet fetch failed:', w.id, e);
        perWalletBalances.push([]);
      }
    }

    // 2) merge all balances into one flat list
    const merged: Balance[] = ([] as Balance[]).concat(...perWalletBalances);

	// 3) price map by symbol (shared across chains)
	const symbols = Array.from(new Set(merged.map(b => b.symbol).filter(Boolean))) as string[];
	const priceMap: Record<string, number> = {};

	// bank currency is 1:1
	priceMap[bankCurrency] = 1;

	for (const s of symbols) {
	  if (s === bankCurrency) continue; // skip fetching bankCurrency
	  try {
	    const p = await fetchFiatQuote(s, bankCurrency);
	    if (p !== null) priceMap[s] = p;
	  } catch (e) {
	    console.warn('[store][BalanceStore] quote error for', s, e);
	  }
	}


    // 4) compute total fiat
    const total = merged.reduce((acc, b) => {
      const qty = Number(b.balance ?? '0');
      const px = priceMap[b.symbol ?? ''] ?? 0;
      return acc + qty * px;
    }, 0);

    runInAction(() => {
      this.setUserBalance(merged);
      this.setTotalBalance(total);
    });

    return merged;
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
