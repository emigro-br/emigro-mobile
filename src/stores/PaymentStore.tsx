import * as Crypto from 'expo-crypto';
import { action, makeAutoObservable, observable } from 'mobx';
import { PixElementType, hasError, parsePix } from 'pix-utils';

import {
  brcodePaymentPreview,
  createBrcodePayment,
  getBrcodePayment,
  sendTransaction,
} from '@/services/emigro/transactions';
import { BrcodePaymentRequest, TransactionRequest, TransactionType } from '@/services/emigro/types';
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

    const assetCode = isoToCrypto[res.payment.currency as keyof typeof isoToCrypto] ?? CryptoAsset.BRL; // Pix is aways in BRL

    const pixPayment: PixPayment = {
      brCode,
      merchantName: res.payment.name,
      merchantCity: pix.merchantCity,
      transactionAmount: res.payment.amount,
      pixKey: res.payment.pixKey,
      assetCode,
      taxId: res.payment.taxId,
      bankName: res.payment.bankName,
      txid: res.payment.txId,
    };
    return pixPayment;
  }

  async pay() {
    const { type, from, to, idempotencyKey } = this.transaction!;
    const transactionRequest: TransactionRequest = {
      type,
      maxAmountToSend: from.value.toString(), // cry
      sourceAssetCode: from.asset,
      destination: to.wallet,
      destinationAmount: to.value.toString(),
      destinationAssetCode: to.asset,
      idempotencyKey,
    };
    const res = await sendTransaction(transactionRequest);
    return res;
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
      sourceAsset: this.transaction.from.asset, // selected Asset
      taxId: pixPayment.taxId,
      description: pixPayment.infoAdicional || 'Payment via Emigro Wallet',
    };
    let result = await createBrcodePayment(paymentRequest);
    console.debug('Payment request sent:', result.id, result.status);

    // Wait for payment to be processed
    let attempts = 0;
    const interval = 2000;
    const maxAttempts = 20; // 40 seconds
    const waitStatus = ['created', 'pending'];
    while (waitStatus.includes(result.status) && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, interval));
      result = await getBrcodePayment(result.id);
      console.debug('Payment status:', result.status);
      attempts++;
    }

    if (result.status === 'failed') {
      throw new Error('Pix Payment failed');
    }

    return result;
  }
}

export const paymentStore = new PaymentStore();
