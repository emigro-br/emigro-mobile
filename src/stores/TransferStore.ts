import * as Crypto from 'expo-crypto';

import { getTransaction, transfer as transferTransaction } from '@/services/emigro/transactions';
import { CryptoAsset } from '@/types/assets';

import { waitTransaction } from './utils';

export type TransferTransaction = {
  destinationAddress: string;
  asset: CryptoAsset;
  amount: number;
  // fee: number;
  idempotencyKey?: string;
};

export class TransferStore {
  transaction?: TransferTransaction;

  setTransfer(transaction?: TransferTransaction) {
    if (transaction) {
      transaction.idempotencyKey = Crypto.randomUUID();
    }
    this.transaction = transaction;
  }

  async transfer() {
    if (!this.transaction) {
      throw new Error('Transaction not set');
    }

    // map to dto
    const data = {
      destinationAddress: this.transaction.destinationAddress,
      assetCode: this.transaction.asset,
      amount: this.transaction.amount,
      idempotencyKey: this.transaction.idempotencyKey,
    };

    let result = await transferTransaction(data);
    result = await waitTransaction(result.id, getTransaction);

    if (result.status === 'failed') {
      throw new Error('Transaction failed');
    }

    return result;
  }
}

export const transferStore = new TransferStore();
