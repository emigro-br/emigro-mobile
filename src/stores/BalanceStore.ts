import { getUserBalance } from "@/services/emigro";
import { IBalance } from "@/types/IBalance";
import { makeAutoObservable } from "mobx";

export class BalanceStore {
  userBalance: IBalance[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  setUserBalance(balance: IBalance[]) : void {
    this.userBalance = balance;
  }

  get(assetCode: string) : number {
    const found = this.userBalance.find((balance) => balance.assetCode === assetCode);
    if (found) return Number(found.balance); //TODO: change the balance to number
    return 0;
  }

  async fetchUserBalance() : Promise<IBalance[]> {
    try {
      console.debug('Fetching user balance...');
      const balances = await getUserBalance();
      this.setUserBalance(balances);
      return balances;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to fetch user balance');
    }
  }
}

export default new BalanceStore();
