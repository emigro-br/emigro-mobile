import { action, makeAutoObservable, observable } from 'mobx';

import { ITransactionRequest } from '@/types/ITransactionRequest';
import { Payment } from '@/types/PixPayment';
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

type TransactionParty = {
  wallet: string;
  asset: CryptoAsset;
  value: number;
};

type PayTransaction = {
  from: TransactionParty;
  to: TransactionParty;
  rate: number;
  fees: number;
};

export class PaymentStore {
  transaction?: PayTransaction;
  scannedPayment?: Payment;

  constructor() {
    makeAutoObservable(this, {
      transaction: observable,
      setTransaction: action,
      //
      scannedPayment: observable,
      setScannedPayment: action,
    });
  }

  setTransaction(transaction?: PayTransaction) {
    this.transaction = transaction;
  }

  setScannedPayment(payment?: Payment) {
    this.scannedPayment = payment;
  }

  reset() {
    this.setTransaction(undefined);
    this.setScannedPayment(undefined);
  }

  setTransfer(amount: number, asset: CryptoAsset, destinationWallet: string) {
    const transfer: PayTransaction = {
      from: {
        wallet: sessionStore.publicKey!,
        asset,
        value: amount,
      },
      to: {
        wallet: destinationWallet,
        asset,
        value: amount,
      },
      rate: 1,
      fees: 0,
    };
    this.setTransaction(transfer);
  }

  setSwap(swap: SwapTransaction) {
    const swapTransaction: PayTransaction = {
      from: {
        wallet: sessionStore.publicKey!,
        asset: swap.from,
        value: swap.fromValue,
      },
      to: {
        wallet: sessionStore.publicKey!,
        asset: swap.to,
        value: swap.toValue,
      },
      rate: swap.rate,
      fees: swap.fees,
    };
    this.setTransaction(swapTransaction);
  }

  public async pay() {
    const { from, to } = this.transaction!;
    const transactionRequest: ITransactionRequest = {
      maxAmountToSend: from.value.toString(), // cry
      sourceAssetCode: from.asset,
      destination: to.wallet,
      destinationAmount: to.value.toString(),
      destinationAssetCode: to.asset,
    };
    const res = await sendTransaction(transactionRequest);
    return res;
  }
}

export const paymentStore = new PaymentStore();
