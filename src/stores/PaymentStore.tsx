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
  pixTransferDetails?: { pixKey: string; value: number; name: string; taxId: string };

  constructor() {
    makeAutoObservable(this, {
      transaction: observable,
      setTransaction: action,
      //
      scannedPayment: observable,
      setScannedPayment: action,
      //
      pixTransferDetails: observable,
      setPixTransferDetails: action,
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

  setPixTransferDetails(details: { pixKey: string; value: number; name: string; taxId: string }) {
    this.pixTransferDetails = details;
  }

  resetPixTransferDetails() {
    this.pixTransferDetails = undefined;
  }

  reset() {
    this.setTransaction(undefined);
    this.setScannedPayment(undefined);
    this.resetPixTransferDetails();
  }

  async preview(brCode: string): Promise<Payment | PixPayment> {
    const pix = parsePix(brCode);
    if (hasError(pix) || pix.type === PixElementType.INVALID) {
      throw new InvalidPixError(brCode);
    }

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

    const res = await pixApi.brcodePaymentPreview(brCode);

    const assetCode = isoToCrypto[res.currency as keyof typeof isoToCrypto] ?? CryptoAsset.BRZ;

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
    const data: CreatePaymentTransaction = {
      destinationAddress: to.wallet,
      sendAssetCode: from.asset,
      destAssetCode: to.asset,
      destAmount: to.value,
      sendMax: from.value,
      idempotencyKey,
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

async payPix() {
  try {
    console.log('[payPix] Initiating Pix payment...');

    // Validate that we have payment details
    if (!this.scannedPayment && !this.pixTransferDetails) {
      throw new Error('No payment details available');
    }
    if (!this.transaction) {
      throw new Error('No transaction set');
    }

    console.log('[payPix] Pix Transfer Details:', this.pixTransferDetails);
    console.log('[payPix] Transaction Details:', this.transaction);

    let paymentRequest: BrcodePaymentRequest;

    // Handle manually input Pix details
    if (this.pixTransferDetails) {
      const { pixKey, value, name, taxId } = this.pixTransferDetails;

      // Construct the payment request
      paymentRequest = {
        pixKey,
        amount: value,
        exchangeAsset: 'BRL', // Ensure the payment asset is BRL
        currency: 'BRL', // Specify the currency explicitly
        taxIdCountry: 'BRA', // Country code for Brazil
        name,
        taxId,
        description: 'Payment via Emigro Wallet',
      };
    } else {
      // Handle scanned payment with PixKey
      const pixPayment = this.scannedPayment as PixPayment;

      // Ensure the scanned payment has a PixKey
      if (!pixPayment.pixKey) {
        throw new Error('No pixKey found in scannedPayment');
      }

      // Construct the payment request
      paymentRequest = {
        pixKey: pixPayment.pixKey,
        amount: this.transaction.to.value, // Value from transaction details
        exchangeAsset: 'BRL', // Payment asset
        currency: 'BRL', // Currency
        taxIdCountry: 'BRA', // Brazil country code
        name: pixPayment.merchantName,
        taxId: pixPayment.taxId,
        description: pixPayment.infoAdicional || 'Payment via Emigro Wallet',
      };
    }

    // Log the final payment request
    console.log('[payPix] Final Payment Request:', paymentRequest);

    try {
      // Send the payment request via the Pix API
      const result = await pixApi.createBrcodePayment(paymentRequest);

      // Log the response from the API
      console.log('[payPix] API Response:', result);

      // Wait for the final status of the transaction
      return await waitTransaction({
        transactionId: result.id,
        fetchFn: pixApi.getBrcodePayment,
        initialDelay: 10000, // 10 seconds delay before first status check
        maxAttempts: 20, // Retry up to 20 times
      });
    } catch (error) {
      // Log API errors
      console.error('[payPix] API Error:', error.response?.data || error.message);
      console.error('[payPix] Payload:', paymentRequest);

      // Re-throw the error after logging
      throw error;
    }
  } catch (error) {
    // Log any general errors during execution
    console.error('[payPix] General Error:', error.message || error);
    throw error;
  }
}





}

export const paymentStore = new PaymentStore();
