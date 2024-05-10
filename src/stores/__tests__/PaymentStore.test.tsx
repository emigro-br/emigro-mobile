import * as transactionApi from '@/services/emigro/transactions';
import { PaymentResponse } from '@/services/emigro/types';
import { Payment, PixPayment } from '@/types/PixPayment';
import { CryptoAsset } from '@/types/assets';

import { PaymentStore, SwapTransaction } from '../PaymentStore';

jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn().mockReturnValue('mocked-uuid'),
}));

jest.mock('@/stores/SessionStore', () => ({
  sessionStore: {
    publicKey: 'mockedPublicKey',
  },
}));

const mockedResponse = {
  transactionHash: 'mocked-hash',
} as PaymentResponse;

describe('PaymentStore', () => {
  let swapBloc: PaymentStore;

  beforeEach(() => {
    swapBloc = new PaymentStore();
  });

  it('should pay with correct parameters', async () => {
    const sendTransactionMock = jest.spyOn(transactionApi, 'sendTransaction').mockResolvedValueOnce(mockedResponse);

    const sourceAsset = CryptoAsset.XLM;
    const destAsset = CryptoAsset.USDC;
    swapBloc.setTransaction({
      type: 'payment',
      from: {
        wallet: 'user-public',
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

    await swapBloc.pay();

    expect(sendTransactionMock).toHaveBeenCalledWith({
      type: 'payment',
      maxAmountToSend: '100',
      destinationAmount: '10',
      destination: 'merchant-public',
      sourceAssetCode: sourceAsset,
      destinationAssetCode: destAsset,
      idempotencyKey: expect.any(String),
    });
  });

  it('should call transfer with correct parameters', async () => {
    const sendTransactionMock = jest.spyOn(transactionApi, 'sendTransaction').mockResolvedValueOnce(mockedResponse);

    const asset = CryptoAsset.BRL;
    swapBloc.setTransfer(100, asset, 'mockedPublicKey');

    await swapBloc.pay();

    expect(sendTransactionMock).toHaveBeenCalledWith({
      type: 'transfer',
      maxAmountToSend: '100',
      destinationAmount: '100',
      destination: 'mockedPublicKey',
      sourceAssetCode: asset,
      destinationAssetCode: asset,
      idempotencyKey: expect.any(String),
    });
  });

  it('should call swap with correct parameters', async () => {
    const sendTransactionMock = jest.spyOn(transactionApi, 'sendTransaction').mockResolvedValueOnce(mockedResponse);

    const transaction: SwapTransaction = {
      from: CryptoAsset.EURC,
      fromValue: 100,
      to: CryptoAsset.BRL,
      toValue: 120,
      rate: 1.2,
      fees: 0,
    };

    swapBloc.setSwap(transaction);

    await swapBloc.pay();

    // check sendTransaction is called with correct parameters
    expect(sendTransactionMock).toHaveBeenCalledWith({
      type: 'swap',
      maxAmountToSend: '100', // cry
      destinationAmount: '120',
      destination: 'mockedPublicKey',
      sourceAssetCode: CryptoAsset.EURC,
      destinationAssetCode: CryptoAsset.BRL,
      idempotencyKey: expect.any(String),
    });
  });

  it('should call preview pix payment correctly', async () => {
    const brcodePaymentPreview = jest.spyOn(transactionApi, 'brcodePaymentPreview').mockResolvedValueOnce({
      type: 'test-type',
      payment: {
        pixKey: 'test-pixKey',
        amount: 100,
        name: 'test-name',
        bankName: 'test-bankName',
        taxId: 'test-taxId',
        txId: 'test-txid',
      },
    });

    const merchantName = 'Test';
    const merchantCity = 'Cidade';
    //TODO: we can also use pix-utils to generate a valid brCode
    const validBrCode = `00020126320014br.gov.bcb.pix0110random-key520400005303986540115802BR5904${merchantName}6006${merchantCity}62070503***6304ACF0`;

    const preview = await swapBloc.preview(validBrCode);

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

    const preview = await swapBloc.preview(emigroBrCode);

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
    await expect(swapBloc.preview(invalidBrCode)).rejects.toThrow('Invalid Pix code');
  });

  it('should call pay with pix payment correctly', async () => {
    const brcodePayment = jest
      .spyOn(transactionApi, 'brcodePayment')
      .mockResolvedValueOnce({ transactionHash: 'hash' });

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

    swapBloc.setScannedPayment(pixPayment);
    swapBloc.setTransaction(transaction);

    const result = await swapBloc.payPix();

    // check sendTransaction is called with correct parameters
    expect(brcodePayment).toHaveBeenCalledWith({
      brcode: pixPayment.brCode,
      sourceAsset: transaction.from.asset,
      amount: transaction.to.value,
      taxId: pixPayment.taxId,
      description: 'test-infoAdicional',
    });

    expect(result).toEqual({ transactionHash: 'hash' });
  });
});
