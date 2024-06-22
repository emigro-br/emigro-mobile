import * as Crypto from 'expo-crypto';

import { getTransaction, swap as swapTransaction } from '@/services/emigro/transactions';
import { CryptoAsset } from '@/types/assets';

import { waitTransaction } from './utils';

export type SwapTransaction = {
  fromAsset: CryptoAsset;
  fromValue: number;
  toAsset: CryptoAsset;
  toValue: number;
  rate: number;
  idempotencyKey?: string;
};

export class SwapStore {
  transaction?: SwapTransaction;

  setSwap(transaction?: SwapTransaction) {
    if (transaction) {
      transaction.idempotencyKey = Crypto.randomUUID();
    }
    this.transaction = transaction;
  }

  async swap() {
    if (!this.transaction) {
      throw new Error('Transaction not set');
    }

    // map to dto
    const data = {
      fromAsset: this.transaction.fromAsset,
      toAsset: this.transaction.toAsset,
      amount: this.transaction.fromValue,
      estimated: this.transaction.toValue,
      idempotencyKey: this.transaction.idempotencyKey,
    };

    let result = await swapTransaction(data);
    result = await waitTransaction(result.id, getTransaction);

    if (result.status === 'failed') {
      throw new Error('Transaction failed');
    }

    return result;
  }
}

export const swapStore = new SwapStore();
