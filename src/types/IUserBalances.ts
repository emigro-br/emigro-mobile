import { IBalance } from "./IBalance";

export interface IUserBalances {
    publicKey: string;
    balances: IBalance[];
}