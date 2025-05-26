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
import { balanceStore } from '@/stores/BalanceStore';
import { sessionStore } from '@/stores/SessionStore';


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

  async preview(brCode: string): Promise<PixPayment> {
    const pix = parsePix(brCode);
    console.log('[PaymentStore][preview] Parsed Pix:', pix);

    if (hasError(pix) || pix.type === PixElementType.INVALID) {
      console.error('[PaymentStore][preview] ❌ Invalid Pix code');
      throw new InvalidPixError(brCode);
    }

    // Support Emigro static QR (optional, if still relevant)
    if (pix.merchantCategoryCode === emigroCategoryCode && pix.type === PixElementType.STATIC) {
      console.log('[PaymentStore][preview] Detected Emigro static QR');
      return {
        brCode,
        merchantName: pix.merchantName,
        merchantCity: pix.merchantCity,
        transactionAmount: pix.transactionAmount,
        pixKey: pix.pixKey,
        infoAdicional: pix.infoAdicional,
        assetCode: 'BRL', // temporary placeholder
        walletKey: '',     // will be resolved later
        bankName: '',
        taxId: '',
        txid: '',
      } as PixPayment;
    }

    // Real PIX QR: fetch preview from API
    const res = await pixApi.brcodePaymentPreview(brCode);
    console.log('[PaymentStore][preview] API Response:', res);

    return {
      brCode,
      merchantName: res.name,
      merchantCity: pix.merchantCity,
      transactionAmount: res.amount,
      pixKey: res.pixKey,
      assetCode: 'BRL', // just use fiat for display
      walletKey: '',    // resolve wallet later
      taxId: res.taxId,
      bankName: res.bankName,
      txid: res.txId,
      infoAdicional: res.txId,
    } as PixPayment;
  }




  async pay() {
    if (!this.transaction) throw new Error('No transaction set');

    const { from, to, idempotencyKey } = this.transaction;
    const data: CreatePaymentTransaction = {
      destinationAddress: to.wallet,
      sendAssetCode: from.asset,
      destAssetCode: to.asset,
      destAmount: to.value,
      sendMax: from.value,
      idempotencyKey: idempotencyKey!,
    };

    console.log('[PaymentStore][pay] Sending transaction:', data);
    let result = await paymentTransaction(data);

    console.log('[PaymentStore][pay] Waiting for confirmation, txId:', result.id);
    result = await waitTransaction({
      transactionId: result.id,
      fetchFn: getTransaction,
      initialDelay: 3000,
      maxAttempts: 25,
    });

    if (result.status === 'failed') {
      console.error('[PaymentStore][pay] Transaction failed');
      throw new Error('Transaction failed');
    }

    console.log('[PaymentStore][pay] Transaction success:', result);
    return result;
  }

  async payPix() {
    if (!this.scannedPayment) throw new Error('No payment scanned');
    if (!this.transaction) throw new Error('No transaction set');

    const pixPayment = this.scannedPayment as PixPayment;

    const paymentRequest: BrcodePaymentRequest = {
      brcode: pixPayment.brCode,
      amount: this.transaction.to.value,
      exchangeAsset: this.transaction.from.asset,
      name: pixPayment.merchantName,
      ...(pixPayment.taxId ? { taxId: pixPayment.taxId } : {}),
      description: pixPayment.infoAdicional || 'Payment via Emigro Wallet',
    };

    console.log('[PaymentStore][payPix] Sending Pix payment request:', paymentRequest);
    let result = await pixApi.createBrcodePayment(paymentRequest);

    console.log('[PaymentStore][payPix] Waiting for confirmation, txId:', result.id);
    result = await waitTransaction({
      transactionId: result.id,
      fetchFn: pixApi.getBrcodePayment,
      initialDelay: 30000,
      maxAttempts: 30,
    });

    if (result.status === 'failed') {
      console.error('[PaymentStore][payPix] Pix payment failed');
      throw new Error('Pix Payment failed');
    }

    console.log('[PaymentStore][payPix] Pix payment success:', result);
    return result;
  }
}

export const paymentStore = new PaymentStore();
