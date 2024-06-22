import * as transactions from '@/services/emigro/transactions';
import { Transaction } from '@/services/emigro/types';
import { TransferStore, TransferTransaction } from '@/stores/TransferStore';
import * as utils from '@/stores/utils';
import { CryptoAsset } from '@/types/assets';

jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn().mockReturnValue('mocked-uuid'),
}));

describe('TransferStore', () => {
  let transferStore: TransferStore;

  beforeEach(() => {
    transferStore = new TransferStore();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('setTransfer', () => {
    it('should set the transaction and generate an idempotency key', () => {
      const transaction: TransferTransaction = {
        destinationAddress: 'mocked-destination-address',
        asset: CryptoAsset.XLM,
        amount: 1,
      };

      transferStore.setTransfer(transaction);

      expect(transferStore.transaction).toEqual({
        ...transaction,
        idempotencyKey: 'mocked-uuid',
      });
    });

    it('should set the transaction without generating an idempotency key if transaction is falsy', () => {
      transferStore.setTransfer(undefined);

      expect(transferStore.transaction).toBeUndefined();
    });
  });

  describe('transfer', () => {
    const transaction: TransferTransaction = {
      destinationAddress: 'mocked-destination-address',
      asset: CryptoAsset.XLM,
      amount: 1,
    };

    beforeEach(() => {
      transferStore.setTransfer(transaction);
    });

    it('should throw an error if transaction is not set', async () => {
      transferStore.setTransfer(undefined);

      await expect(transferStore.transfer()).rejects.toThrow('Transaction not set');
    });

    it('should call transferTransaction with the correct data', async () => {
      const result = { id: '123', status: 'created' } as Transaction;
      const transferSpy = jest.spyOn(transactions, 'transfer').mockResolvedValueOnce(result);
      jest.spyOn(utils, 'waitTransaction').mockResolvedValueOnce(result);

      await transferStore.transfer();

      expect(transferSpy).toHaveBeenCalledWith({
        destinationAddress: 'mocked-destination-address',
        assetCode: CryptoAsset.XLM,
        amount: 1,
        idempotencyKey: expect.any(String),
      });
    });

    it('should call waitTransaction with the correct parameters', async () => {
      const result = { id: '123', status: 'created' } as Transaction;
      jest.spyOn(transactions, 'transfer').mockResolvedValueOnce(result);
      jest.spyOn(utils, 'waitTransaction').mockResolvedValueOnce(result);

      await transferStore.transfer();

      expect(utils.waitTransaction).toHaveBeenCalledWith('123', transactions.getTransaction);
    });

    it('should throw an error if the transaction status is "failed"', async () => {
      const result = { id: '123', status: 'failed' } as Transaction;
      jest.spyOn(transactions, 'transfer').mockResolvedValueOnce(result);
      jest.spyOn(utils, 'waitTransaction').mockResolvedValueOnce(result);

      await expect(transferStore.transfer()).rejects.toThrow('Transaction failed');
    });

    it('should return the result if the transaction is successful', async () => {
      const transferResult = { id: '123', status: 'paid' } as Transaction;
      jest.spyOn(transactions, 'transfer').mockResolvedValueOnce(transferResult);
      jest.spyOn(utils, 'waitTransaction').mockResolvedValueOnce(transferResult);

      const result = await transferStore.transfer();

      expect(result).toEqual(transferResult);
    });
  });
});
