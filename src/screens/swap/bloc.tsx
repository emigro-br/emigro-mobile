import { makeAutoObservable } from 'mobx';

import { ITransactionRequest } from '@/types/ITransactionRequest';
import { CryptoAsset } from '@/types/assets';

import { sendTransaction } from '@services/emigro';

import { sessionStore } from '@stores/SessionStore';

export type SwapTransaction = {
  from: CryptoAsset;
  fromValue: number;
  to: CryptoAsset;
  toValue: number;
  rate: number;
  fees: number;
};

export class SwapBloc {
  _publicKey?: string;
  transaction?: SwapTransaction;

  constructor() {
    makeAutoObservable(this);
  }

  setTransaction(transaction: SwapTransaction) {
    this.transaction = transaction;
  }

  reset() {
    this.transaction = undefined;
  }

  private async publicKey() {
    if (this._publicKey) {
      return this._publicKey;
    }

    const session = sessionStore.session;
    if (session && session.publicKey) {
      this._publicKey = session.publicKey;
      return this._publicKey;
    }
    throw new Error('User wallet address not found.');
  }

  public async swap() {
    const { from, fromValue, to, toValue } = this.transaction!;
    const transactionRequest: ITransactionRequest = {
      maxAmountToSend: fromValue.toString(), // cry
      destinationAmount: toValue.toString(),
      destination: await this.publicKey(),
      sourceAssetCode: from,
      destinationAssetCode: to,
    };
    const res = await sendTransaction(transactionRequest);
    return res;
  }
}

export default new SwapBloc();
