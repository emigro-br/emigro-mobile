import * as Crypto from 'expo-crypto';

import { getTransaction, swap as swapTransaction } from '@/services/emigro/transactions';
import { CryptoAsset } from '@/types/assets';

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

  setSwap(transaction: SwapTransaction) {
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
    result = await this.waitTransaction(result.id, getTransaction);

    if (result.status === 'failed') {
      throw new Error('Transaction failed');
    }

    return result;
  }

  // TODO: externalize this function
  async waitTransaction(transactionId: string, fetchFn: (id: string) => Promise<any>) {
    // Wait for payment to be processed
    let attempts = 0;
    const interval = 2000;
    const maxAttempts = 20; // 40 seconds
    let result;
    let status = 'created';

    const waitStatus = ['created', 'pending'];
    while (waitStatus.includes(status) && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, interval));
      result = await fetchFn(transactionId);
      console.debug('Payment status:', result.status);
      status = result.status;
      attempts++;
    }
    return result;
  }
}

export const swapStore = new SwapStore();
