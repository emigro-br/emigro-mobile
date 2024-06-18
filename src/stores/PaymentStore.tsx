import * as Crypto from 'expo-crypto';
import { action, makeAutoObservable, observable } from 'mobx';
import { PixElementType, hasError, parsePix } from 'pix-utils';

import {
  brcodePaymentPreview,
  createBrcodePayment,
  createTransaction,
  getBrcodePayment,
  getTransaction,
} from '@/services/emigro/transactions';
import { BrcodePaymentRequest, CreateTransactionRequest, TransactionType } from '@/services/emigro/types';
import { sessionStore } from '@/stores/SessionStore';
import { Payment, PixPayment, emigroCategoryCode } from '@/types/PixPayment';
import { CryptoAsset } from '@/types/assets';
import { isoToCrypto } from '@/utils/assets';

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
  type: TransactionType;
  from: TransactionParty;
  to: TransactionParty;
  rate: number;
  fees: number;
  idempotencyKey?: string;
};

export class PaymentStore {
  transaction?: PayTransaction;
  scannedPayment?: Payment | PixPayment;

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
    if (transaction) {
      transaction.idempotencyKey = Crypto.randomUUID();
    }
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
      type: 'transfer',
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
      type: 'swap',
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

  async preview(brCode: string): Promise<Payment | PixPayment> {
    const pix = parsePix(brCode);
    if (hasError(pix) || pix.type === PixElementType.INVALID) {
      throw new Error('Invalid Pix code');
    }

    if (pix.merchantCategoryCode === emigroCategoryCode && pix.type === PixElementType.STATIC) {
      // It's Emigro a Payment
      const { merchantName, merchantCity, transactionAmount, infoAdicional } = pix;
      return {
        brCode,
        merchantName,
        merchantCity,
        transactionAmount,
        infoAdicional,
        walletKey: pix.pixKey,
        assetCode: isoToCrypto[pix.transactionCurrency as keyof typeof isoToCrypto],
      } as Payment;
    }

    const res = await brcodePaymentPreview(brCode);

    const assetCode = isoToCrypto[res.currency as keyof typeof isoToCrypto] ?? CryptoAsset.BRL; // Pix is aways in BRL

    const pixPayment: PixPayment = {
      brCode,
      merchantName: res.name,
      merchantCity: pix.merchantCity,
      transactionAmount: res.amount,
      pixKey: res.pixKey,
      assetCode,
      taxId: res.taxId,
      bankName: res.bankName,
      txid: res.txId,
    };
    return pixPayment;
  }

  async pay() {
    const { type, from, to, idempotencyKey } = this.transaction!;
    const transactionRequest: CreateTransactionRequest = {
      type,
      maxAmountToSend: from.value.toString(), // cry
      sourceAssetCode: from.asset,
      destination: to.wallet,
      destinationAmount: to.value.toString(),
      destinationAssetCode: to.asset,
      idempotencyKey,
    };

    let result = await createTransaction(transactionRequest);
    result = await this.waitTransaction(result.id, getTransaction);

    if (result.status === 'failed') {
      throw new Error('Transaction failed');
    }

    return result;
  }

  async payPix() {
    if (!this.scannedPayment) {
      throw new Error('No payment scanned');
    }

    if (!this.transaction) {
      throw new Error('No transaction set');
    }

    const pixPayment = this.scannedPayment as PixPayment;
    const paymentRequest: BrcodePaymentRequest = {
      brcode: pixPayment.brCode,
      amount: this.transaction.to.value, // BRL value
      exchangeAsset: this.transaction.from.asset, // selected Asset
      taxId: pixPayment.taxId,
      description: pixPayment.infoAdicional || 'Payment via Emigro Wallet',
    };
    let result = await createBrcodePayment(paymentRequest);
    console.debug('Payment request sent:', result.id, result.status);

    result = await this.waitTransaction(result.id, getBrcodePayment);

    if (result.status === 'failed') {
      throw new Error('Pix Payment failed');
    }

    return result;
  }

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

export const paymentStore = new PaymentStore();
