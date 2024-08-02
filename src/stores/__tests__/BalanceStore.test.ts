import { Balance } from '@/services/emigro/types';
import * as usersApi from '@/services/emigro/users';
import { CryptoAsset } from '@/types/assets';

import { BalanceStore } from '../BalanceStore';

jest.mock('@/services/emigro/users', () => ({
  getUserBalance: jest.fn(),
}));

describe('BalanceStore', () => {
  let balanceStore: BalanceStore;
  const mockBalances: Balance[] = [
    {
      assetType: 'someAssetType',
      assetCode: 'XLM',
      balance: '100',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    balanceStore = new BalanceStore();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should set user balance', () => {
    balanceStore.setUserBalance(mockBalances);
    expect(balanceStore.userBalance).toEqual(mockBalances);
  });

  it('should fetch user balance', async () => {
    (usersApi.getUserBalance as jest.Mock).mockResolvedValue(mockBalances);

    expect(balanceStore.totalBalance).toEqual(0);

    await balanceStore.fetchUserBalance();

    expect(usersApi.getUserBalance).toHaveBeenCalledTimes(1);
    expect(balanceStore.userBalance).toEqual(mockBalances);
    expect(balanceStore.totalBalance).toEqual(100);
  });

  it('should not call api twice on fetch user balance in short period', async () => {
    (usersApi.getUserBalance as jest.Mock).mockResolvedValue(mockBalances);

    // call 2x
    await balanceStore.fetchUserBalance();
    await balanceStore.fetchUserBalance();

    expect(usersApi.getUserBalance).toHaveBeenCalledTimes(1);
  });

  it('should force to call api twice on fetch balance even in short period', async () => {
    (usersApi.getUserBalance as jest.Mock).mockResolvedValue(mockBalances);

    // call 2x
    await balanceStore.fetchUserBalance({ force: true });
    await balanceStore.fetchUserBalance({ force: true });

    expect(usersApi.getUserBalance).toHaveBeenCalledTimes(2);
  });

  it('should throw an error when fetching user balance fails', async () => {
    const message = 'Failed to fetch user balance';
    const error = new Error(message);
    (usersApi.getUserBalance as jest.Mock).mockRejectedValue(error);
    jest.spyOn(balanceStore, 'setUserBalance');

    expect(balanceStore.fetchUserBalance()).rejects.toThrow();

    expect(usersApi.getUserBalance).toHaveBeenCalled();
    expect(balanceStore.setUserBalance).not.toHaveBeenCalled();
  });

  it('should return user balance', () => {
    balanceStore.setUserBalance(mockBalances);
    expect(balanceStore.get(CryptoAsset.XLM)).toBe(100);
  });

  it('should find the balance by asset code', () => {
    const balanceStore = new BalanceStore();
    const mockBalances: Balance[] = [
      {
        assetType: 'someAssetType',
        assetCode: 'XLM',
        balance: '100',
      },
    ];
    balanceStore.setUserBalance(mockBalances);

    const foundBalance = balanceStore.find(CryptoAsset.XLM);

    expect(foundBalance).toEqual(mockBalances[0]);
  });

  it('should return undefined when balance is not found', () => {
    const balanceStore = new BalanceStore();
    const mockBalances: Balance[] = [
      {
        assetType: 'someAssetType',
        assetCode: 'XLM',
        balance: '100',
      },
    ];
    balanceStore.setUserBalance(mockBalances);

    const foundBalance = balanceStore.find(CryptoAsset.SRT);

    expect(foundBalance).toBeUndefined();
  });
});
