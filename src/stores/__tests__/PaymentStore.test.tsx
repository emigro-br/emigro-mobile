import { PixPayment } from '@/types/PixPayment';
import { CryptoAsset } from '@/types/assets';

import * as transactionApi from '@services/transaction';

import { PaymentStore, SwapTransaction } from '../PaymentStore';

jest.mock('@stores/SessionStore', () => ({
  sessionStore: {
    publicKey: 'mockedPublicKey',
  },
}));

jest.mock('@services/emigro', () => ({
  sendTransaction: jest.fn().mockResolvedValue({ transactionHash: 'hash' }),
}));

describe('SwapBloc', () => {
  let swapBloc: PaymentStore;

  beforeEach(() => {
    swapBloc = new PaymentStore();
  });

  it('should call swap with correct parameters', async () => {
    const emigro = jest.requireMock('@services/emigro');

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
    expect(emigro.sendTransaction).toHaveBeenCalledWith({
      maxAmountToSend: '100', // cry
      destinationAmount: '120',
      destination: 'mockedPublicKey',
      sourceAssetCode: CryptoAsset.EURC,
      destinationAssetCode: CryptoAsset.BRL,
    });
  });

  it('should call preview payment correctly', async () => {
    const brcodePaymentPreview = jest.spyOn(transactionApi, 'brcodePaymentPreview').mockResolvedValueOnce({
      type: 'test-type',
      payment: {
        amount: 100,
        name: 'test-name',
        taxId: 'test-taxId',
        bankName: 'test-bankName',
      },
    });

    const payment: PixPayment = {
      brCode: 'test-brCode',
      assetCode: CryptoAsset.BRL,
      transactionAmount: 100,
      taxId: '',
      pixKey: 'test-pixKey',
      txid: 'txid',
      merchantName: 'Merchant Name',
      merchantCity: 'Merchant City',
    };

    const preview = await swapBloc.previewPixPayment(payment);

    expect(brcodePaymentPreview).toHaveBeenCalledWith('test-brCode');

    expect(preview).toEqual({
      ...payment,
      taxId: 'test-taxId',
      bankName: 'test-bankName',
    });
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
