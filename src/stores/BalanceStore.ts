import { getUserBalance } from "@/services/emigro";
import { IBalance } from "@/types/IBalance";
import { makeAutoObservable } from "mobx";

export class BalanceStore {
  userBalance: IBalance[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  setUserBalance(balance: IBalance[]) {
    this.userBalance = balance;
  }

  async fetchUserBalance() {
    try {
      console.debug('Fetching user balance...');
      const balances = await getUserBalance();
      this.setUserBalance(balances);
    } catch (error) {
      console.error(error);
      throw new Error();
    }
  }
}

export default new BalanceStore();
