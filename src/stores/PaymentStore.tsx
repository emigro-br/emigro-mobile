import * as Crypto from 'expo-crypto';
import { action, makeAutoObservable, observable } from 'mobx';
import { PixElementType, hasError, parsePix } from 'pix-utils';

import {
  brcodePaymentPreview,
  createBrcodePayment,
  getBrcodePayment,
  getTransaction,
  payment as paymentTransaction,
} from '@/services/emigro/transactions';
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
    const { from, to, idempotencyKey } = this.transaction!;
    // map to dto
    const data: CreatePaymentTransaction = {
      destinationAddress: to.wallet,
      sendAssetCode: from.asset,
      destAssetCode: to.asset,
      destAmount: to.value,
      sendMax: from.value,
      idempotencyKey,
    };

    let result = await paymentTransaction(data);
    result = await waitTransaction(result.id, getTransaction);

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
      name: pixPayment.merchantName,
      taxId: pixPayment.taxId,
      description: pixPayment.infoAdicional || 'Payment via Emigro Wallet',
    };
    let result = await createBrcodePayment(paymentRequest);

    result = await waitTransaction(result.id, getBrcodePayment);

    if (result.status === 'failed') {
      throw new Error('Pix Payment failed');
    }

    return result;
  }
}

export const paymentStore = new PaymentStore();
