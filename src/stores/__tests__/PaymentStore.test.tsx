import * as transactionApi from '@/services/emigro/transactions';
import { BrcodePaymentResponse, CreatePaymentTransaction, Transaction } from '@/services/emigro/types';
import { Payment, PixPayment } from '@/types/PixPayment';
import { CryptoAsset } from '@/types/assets';

import { PaymentStore } from '../PaymentStore';
import * as utils from '../utils';

jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn().mockReturnValue('mocked-uuid'),
}));

jest.mock('@/stores/SessionStore', () => ({
  sessionStore: {
    publicKey: 'mockedPublicKey',
  },
}));

jest.mock('@/services/emigro/transactions', () => ({
  payment: jest.fn(),
  createTransaction: jest.fn(),
  getTransaction: jest.fn(),
  brcodePaymentPreview: jest.fn(),
  createBrcodePayment: jest.fn(),
  getBrcodePayment: jest.fn(),
}));

const mockTransaction = (status: string): Transaction => ({
  id: 'test-id',
  status,
  type: 'payment',
  from: 'from-wallet',
  to: 'to-wallet',
  amount: 100,
  createdAt: new Date(),
});

describe('PaymentStore', () => {
  let paymentStore: PaymentStore;

  beforeEach(() => {
    jest.clearAllMocks();
    paymentStore = new PaymentStore();
  });

  it('should pay with correct parameters', async () => {
    const paymentSpy = jest.spyOn(transactionApi, 'payment').mockResolvedValueOnce(mockTransaction('created'));
    const waitSpy = jest.spyOn(utils, 'waitTransaction').mockResolvedValueOnce(mockTransaction('paid'));

    const sourceAsset = CryptoAsset.XLM;
    const destAsset = CryptoAsset.USDC;
    paymentStore.setTransaction({
      from: {
        asset: sourceAsset,
        value: 100,
      },
      to: {
        wallet: 'merchant-public',
        asset: destAsset,
        value: 10,
      },
      rate: 1,
      fees: 0,
    });

    await paymentStore.pay();

    const expectedTransaction: CreatePaymentTransaction = {
      destinationAddress: 'merchant-public',
      sendAssetCode: sourceAsset,
      destAssetCode: destAsset,
      destAmount: 10,
      sendMax: 100,
      idempotencyKey: expect.any(String),
    };

    expect(paymentSpy).toHaveBeenCalledWith(expectedTransaction);
    expect(waitSpy).toHaveBeenCalledWith('test-id', transactionApi.getTransaction);
  });

  it('should call preview pix payment correctly', async () => {
    const brcodePaymentPreview = jest.spyOn(transactionApi, 'brcodePaymentPreview').mockResolvedValueOnce({
      brcode: 'test-brcode',
      pixKey: 'test-pixKey',
      amount: 100,
      name: 'test-name',
      bankName: 'test-bankName',
      taxId: 'test-taxId',
      txId: 'test-txid',
    });

    const merchantName = 'Test';
    const merchantCity = 'Cidade';
    //TODO: we can also use pix-utils to generate a valid brCode
    const validBrCode = `00020126320014br.gov.bcb.pix0110random-key520400005303986540115802BR5904${merchantName}6006${merchantCity}62070503***6304ACF0`;

    const preview = await paymentStore.preview(validBrCode);

    expect(brcodePaymentPreview).toHaveBeenCalledWith(validBrCode);

    const expectedPixPayment: PixPayment = {
      brCode: validBrCode,
      assetCode: CryptoAsset.BRL,
      transactionAmount: 100,
      taxId: 'test-taxId',
      pixKey: 'test-pixKey',
      txid: 'test-txid',
      merchantName: 'test-name',
      merchantCity,
      bankName: 'test-bankName',
    };

    expect(preview).toEqual(expectedPixPayment);
  });

  it('should call preview Emigro payment correctly', async () => {
    const merchantName = 'MERDA M';
    const merchantCity = 'SAO PAULO';
    const emigroBrCode =
      '00020126780014br.gov.bcb.pix0156GDIYUSNDY67L7U4IRT2KDT2POUOYBTKKSOUQNFYNDZNKH62AKK74ZPYS52049999530303254040.125802BR5907MERDA M6009SAO PAULO62070503***63040701';

    const preview = await paymentStore.preview(emigroBrCode);

    const expectedPixPayment: Payment = {
      brCode: emigroBrCode,
      infoAdicional: undefined,
      assetCode: CryptoAsset.ARS,
      transactionAmount: 0.12,
      merchantName,
      merchantCity,
      walletKey: 'GDIYUSNDY67L7U4IRT2KDT2POUOYBTKKSOUQNFYNDZNKH62AKK74ZPYS',
    };

    expect(preview).toEqual(expectedPixPayment);
  });

  it('should throw error when preview with invalid brcode', async () => {
    const invalidBrCode = 'invalid-brcode';
    await expect(paymentStore.preview(invalidBrCode)).rejects.toThrow('Invalid Pix code');
  });

  it('should call pay with pix payment correctly', async () => {
    const createdResponse = { id: 'test-id', status: 'created' } as BrcodePaymentResponse;
    const paidResponse = { id: 'test-id', status: 'paid' } as BrcodePaymentResponse;
    const createSpy = jest.spyOn(transactionApi, 'createBrcodePayment').mockResolvedValueOnce(createdResponse);
    const waitSpy = jest.spyOn(utils, 'waitTransaction').mockResolvedValueOnce(paidResponse);

    const pixPayment: PixPayment = {
      assetCode: CryptoAsset.BRL,
      transactionAmount: 100,
      taxId: 'test-taxId',
      pixKey: 'test-pixKey',
      txid: 'txid',
      merchantName: 'Merchant Name',
      merchantCity: 'Merchant City',
      brCode: 'test-brCode',
      infoAdicional: 'test-infoAdicional',
    };

    const transaction = {
      type: 'payment' as any, // FIXME: remove any
      from: {
        wallet: 'user-public-key',
        asset: CryptoAsset.BRL,
        value: pixPayment.transactionAmount,
      },
      to: {
        wallet: 'merchant-public-key',
        asset: CryptoAsset.BRL,
        value: pixPayment.transactionAmount,
      },
      rate: 1,
      fees: 0,
    };

    paymentStore.setScannedPayment(pixPayment);
    paymentStore.setTransaction(transaction);

    const result = await paymentStore.payPix();

    expect(result).toEqual(paidResponse);

    // check sendTransaction is called with correct parameters
    expect(createSpy).toHaveBeenCalledWith({
      brcode: pixPayment.brCode,
      exchangeAsset: transaction.from.asset,
      amount: transaction.to.value,
      taxId: pixPayment.taxId,
      description: 'test-infoAdicional',
    });

    expect(waitSpy).toHaveBeenCalledWith(createdResponse.id, transactionApi.getBrcodePayment);
  });
});
