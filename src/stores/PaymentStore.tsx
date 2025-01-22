import * as Crypto from 'expo-crypto';
import { action, makeAutoObservable, observable } from 'mobx';
import { PixElementType, hasError, parsePix } from 'pix-utils';

import * as pixApi from '@/services/emigro/pix';
import { getTransaction, payment as paymentTransaction } from '@/services/emigro/transactions';
import { BrcodePaymentRequest, CreatePaymentTransaction } from '@/services/emigro/types';
import { Payment, PixPayment, emigroCategoryCode } from '@/types/PixPayment';
import { CryptoAsset } from '@/types/assets';
import { isoToCrypto } from '@/utils/assets';

import { waitTransaction } from './utils';

type TransactionParty = {
  wallet: string;
  asset: CryptoAsset;
  value: number;
};

type PayTransaction = {
  from: {
    asset: CryptoAsset;
    value: number;
  };
  to: TransactionParty;
  rate: number;
  fees: number;
  idempotencyKey?: string;
};

export class InvalidPixError extends Error {
  constructor(brCode: string) {
    super(`Invalid Pix code: ${brCode}`);
  }
}

export class PaymentStore {
  transaction?: PayTransaction;
  scannedPayment?: Payment | PixPayment;

  constructor() {
    makeAutoObservable(this, {
      transaction: observable,
      setTransaction: action,
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

  /**
   * Preview a Pix or Emigro code by parsing and/or calling our brcodePaymentPreview API
   */
  async preview(brCode: string): Promise<Payment | PixPayment> {
    const pix = parsePix(brCode);
    if (hasError(pix) || pix.type === PixElementType.INVALID) {
      throw new InvalidPixError(brCode);
    }

    // If it's an "Emigro" code
    if (pix.merchantCategoryCode === emigroCategoryCode && pix.type === PixElementType.STATIC) {
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

    // Otherwise call our backend's Payment Preview
    const res = await pixApi.brcodePaymentPreview(brCode);

    const assetCode = isoToCrypto[res.currency as keyof typeof isoToCrypto] ?? CryptoAsset.BRZ;
    const pixPayment: PixPayment = {
      brCode,
      merchantName: res.name,
      merchantCity: pix.merchantCity,
      transactionAmount: res.amount,
      pixKey: res.pixKey,
      assetCode,
      taxId: res.taxId,  // can be undefined or a string
      bankName: res.bankName,
      txid: res.txId,
    };
    return pixPayment;
  }

  /**
   * Pay (non-Pix) transaction
   */
  async pay() {
    const { from, to, idempotencyKey } = this.transaction!;
    const data: CreatePaymentTransaction = {
      destinationAddress: to.wallet,
      sendAssetCode: from.asset,
      destAssetCode: to.asset,
      destAmount: to.value,
      sendMax: from.value,
      idempotencyKey: idempotencyKey!,
    };

    let result = await paymentTransaction(data);
    result = await waitTransaction({
      transactionId: result.id,
      fetchFn: getTransaction,
      initialDelay: 3000,
      maxAttempts: 25,
    });

    if (result.status === 'failed') {
      throw new Error('Transaction failed');
    }

    return result;
  }

  /**
   * Pay a Pix transaction
   */
  async payPix() {
    if (!this.scannedPayment) {
      throw new Error('No payment scanned');
    }
    if (!this.transaction) {
      throw new Error('No transaction set');
    }

    const pixPayment = this.scannedPayment as PixPayment;

    // Build request object for backend,
    // omit taxId if it's empty/undefined using spread
    const paymentRequest: BrcodePaymentRequest = {
      brcode: pixPayment.brCode,
      amount: this.transaction.to.value,
      exchangeAsset: this.transaction.from.asset,
      name: pixPayment.merchantName,
      ...(pixPayment.taxId ? { taxId: pixPayment.taxId } : {}),
      description: pixPayment.infoAdicional || 'Payment via Emigro Wallet',
    };

    console.log('[payPix] -> Sending BrcodePaymentRequest:', paymentRequest);

    let result = await pixApi.createBrcodePayment(paymentRequest);

    console.log('[payPix] -> createBrcodePayment() result:', result);

    // wait for transaction to confirm
    result = await waitTransaction({
      transactionId: result.id,
      fetchFn: pixApi.getBrcodePayment,
      initialDelay: 10000,
      maxAttempts: 20,
    });

    console.log('[payPix] -> final transaction result:', result);

    if (result.status === 'failed') {
      throw new Error('Pix Payment failed');
    }

    return result;
  }
}

export const paymentStore = new PaymentStore();
