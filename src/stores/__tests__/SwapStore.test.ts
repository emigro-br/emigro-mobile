import * as transactions from '@/services/emigro/transactions';
import { Transaction } from '@/services/emigro/types';
import { SwapStore } from '@/stores/SwapStore';
import { waitTransaction } from '@/stores/utils';
import { CryptoAsset } from '@/types/assets';

import * as utils from '../utils';

jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn().mockReturnValue('mocked-uuid'),
}));

describe('SwapStore', () => {
  let swapStore: SwapStore;

  beforeEach(() => {
    swapStore = new SwapStore();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('setSwap', () => {
    it('should set the transaction and generate an idempotency key', () => {
      const transaction = {
        fromAsset: CryptoAsset.XLM,
        fromValue: 1,
        toAsset: CryptoAsset.USDC,
        toValue: 0.05,
        rate: 0.05,
      };

      swapStore.setSwap(transaction);

      expect(swapStore.transaction).toEqual({
        ...transaction,
        idempotencyKey: expect.any(String),
      });
    });

    it('should set the transaction without generating an idempotency key if transaction is falsy', () => {
      swapStore.setSwap(undefined);

      expect(swapStore.transaction).toBeUndefined();
    });
  });

  describe('swap', () => {
    const transaction = {
      fromAsset: CryptoAsset.XLM,
      fromValue: 1,
      toAsset: CryptoAsset.USDC,
      toValue: 0.05,
      rate: 0.05,
    };

    beforeEach(() => {
      swapStore.setSwap(transaction);
    });

    it('should throw an error if transaction is not set', async () => {
      swapStore.setSwap(undefined);

      await expect(swapStore.swap()).rejects.toThrow('Transaction not set');
    });

    it('should call swapTransaction with the correct data', async () => {
      const result = { id: '123', status: 'created' } as Transaction;
      const swapSpy = jest.spyOn(transactions, 'swap').mockResolvedValueOnce(result);
      jest.spyOn(utils, 'waitTransaction').mockResolvedValueOnce(result);

      await swapStore.swap();

      expect(swapSpy).toHaveBeenCalledWith({
        fromAsset: CryptoAsset.XLM,
        toAsset: CryptoAsset.USDC,
        amount: 1,
        estimated: 0.05,
        idempotencyKey: expect.any(String),
      });
    });

    it('should call waitTransaction with the correct parameters', async () => {
      const result = { id: '123', status: 'created' } as Transaction;
      jest.spyOn(transactions, 'swap').mockResolvedValueOnce(result);
      jest.spyOn(utils, 'waitTransaction').mockResolvedValueOnce(result);

      await swapStore.swap();

      expect(waitTransaction).toHaveBeenCalledWith({
        transactionId: '123',
        fetchFn: transactions.getTransaction,
      });
    });

    it('should throw an error if the transaction status is "failed"', async () => {
      const result = { id: '123', status: 'failed' } as Transaction;
      jest.spyOn(transactions, 'swap').mockResolvedValueOnce(result);
      jest.spyOn(utils, 'waitTransaction').mockResolvedValueOnce(result);

      await expect(swapStore.swap()).rejects.toThrow('Transaction failed');
    });

    it('should return the result if the transaction is successful', async () => {
      const swapResult = { id: '123', status: 'created' } as Transaction;
      jest.spyOn(transactions, 'swap').mockResolvedValueOnce(swapResult);
      jest.spyOn(utils, 'waitTransaction').mockResolvedValueOnce(swapResult);

      const result = await swapStore.swap();

      expect(result).toEqual(swapResult);
    });
  });
});
